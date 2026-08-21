import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TASK_ACTIVITY_READER } from './task-activity.reader';

// Tasks module for productivity workflows.
@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: TASK_ACTIVITY_READER,
      useExisting: TasksService
    }
  ],
  exports: [TasksService, TASK_ACTIVITY_READER]
})
export class TasksModule {}
