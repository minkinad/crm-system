import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../task.enums';

// DTO for task creation.
export class CreateTaskDto {
  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  reminderAt?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  relatedDealId?: string;

  @IsOptional()
  @IsUUID()
  relatedContactId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
