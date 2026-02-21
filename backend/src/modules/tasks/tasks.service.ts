import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Brackets, Repository } from 'typeorm';
import { RealtimeService } from '../realtime/realtime.service';
import { TASK_REMINDERS_QUEUE } from '../queues/queue.constants';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './task.entity';

// Task service handling reminders and workload management.
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly repository: Repository<TaskEntity>,
    private readonly realtimeService: RealtimeService,
    @InjectQueue(TASK_REMINDERS_QUEUE)
    private readonly taskRemindersQueue: Queue
  ) {}

  async create(tenantId: string, dto: CreateTaskDto) {
    const task = await this.repository.save(this.repository.create({ tenantId, ...dto }));
    await this.scheduleReminderIfNeeded(tenantId, task.id, task.title, dto.ownerId, dto.reminderAt);
    this.realtimeService.publish(tenantId, 'tasks.created', { id: task.id });
    return task;
  }

  async findAll(tenantId: string, query: QueryTasksDto) {
    const qb = this.repository
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId });

    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }

    if (query.priority) {
      qb.andWhere('task.priority = :priority', { priority: query.priority });
    }

    if (query.ownerId) {
      qb.andWhere('task.ownerId = :ownerId', { ownerId: query.ownerId });
    }

    if (query.q) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('task.title ILIKE :q', { q: `%${query.q}%` })
            .orWhere('task.description ILIKE :q', { q: `%${query.q}%` });
        })
      );
    }

    qb.orderBy('task.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findById(tenantId: string, id: string) {
    const task = await this.repository.findOne({ where: { tenantId, id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(tenantId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.findById(tenantId, id);
    Object.assign(task, dto);
    const updated = await this.repository.save(task);
    await this.scheduleReminderIfNeeded(
      tenantId,
      updated.id,
      updated.title,
      updated.ownerId ?? undefined,
      dto.reminderAt
    );
    this.realtimeService.publish(tenantId, 'tasks.updated', {
      id: updated.id,
      status: updated.status
    });
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.repository.softDelete({ tenantId, id });
    await this.taskRemindersQueue.remove(`${tenantId}:${id}`).catch(() => undefined);
    this.realtimeService.publish(tenantId, 'tasks.deleted', { id });
  }

  private async scheduleReminderIfNeeded(
    tenantId: string,
    taskId: string,
    title: string,
    ownerId: string | undefined,
    reminderAt?: string
  ): Promise<void> {
    if (!reminderAt) {
      return;
    }

    const delay = new Date(reminderAt).getTime() - Date.now();
    if (delay <= 0) {
      return;
    }

    const jobId = `${tenantId}:${taskId}`;
    await this.taskRemindersQueue.remove(jobId).catch(() => undefined);
    await this.taskRemindersQueue.add(
      'task-reminder',
      { tenantId, taskId, title, ownerId },
      { delay, jobId, removeOnComplete: true, removeOnFail: 500 }
    );
  }
}
