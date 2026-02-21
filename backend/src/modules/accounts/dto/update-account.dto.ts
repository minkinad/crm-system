import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';

// DTO for updating account records.
export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
