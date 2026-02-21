import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

// DTO for task updates.
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
