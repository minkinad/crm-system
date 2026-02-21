import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Partial DTO for user profile and role updates.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
