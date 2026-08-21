import { NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { RealtimeService } from '../realtime/realtime.service';
import { TaskEntity } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService deletion', () => {
  const repository = { softDelete: jest.fn() } as unknown as Repository<TaskEntity>;
  const realtime = { publish: jest.fn() } as unknown as RealtimeService;
  const queue = { remove: jest.fn() } as unknown as Queue;
  const service = new TasksService(repository, realtime, queue);

  beforeEach(() => jest.clearAllMocks());

  it('does not remove a reminder or publish for a missing task', async () => {
    jest
      .mocked(repository.softDelete)
      .mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });

    await expect(service.remove('tenant-id', 'task-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(queue.remove).not.toHaveBeenCalled();
    expect(realtime.publish).not.toHaveBeenCalled();
  });
});
