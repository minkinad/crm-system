import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RealtimeService } from '../realtime/realtime.service';
import { TASK_REMINDERS_QUEUE } from './queue.constants';

// BullMQ worker for delayed task reminder events.
@Processor(TASK_REMINDERS_QUEUE)
export class TaskReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(TaskReminderProcessor.name);

  constructor(private readonly realtimeService: RealtimeService) {
    super();
  }

  async process(
    job: Job<{
      tenantId: string;
      taskId: string;
      title: string;
      ownerId?: string;
    }>
  ): Promise<void> {
    this.logger.debug(`Reminder fired for task=${job.data.taskId}`);
    this.realtimeService.publish(job.data.tenantId, 'tasks.reminder', job.data);
  }
}
