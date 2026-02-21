import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { TaskPriority, TaskStatus } from '../task.enums';

// DTO for task list filtering.
export class QueryTasksDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
