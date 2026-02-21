import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TaskReminderProcessor } from './task-reminder.processor';
import { TASK_REMINDERS_QUEUE } from './queue.constants';

// Queues module registers asynchronous processors and queue producers.
@Module({
  imports: [
    BullModule.registerQueue({
      name: TASK_REMINDERS_QUEUE
    })
  ],
  providers: [TaskReminderProcessor],
  exports: [BullModule]
})
export class QueuesModule {}
