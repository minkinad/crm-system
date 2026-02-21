import { PartialType } from '@nestjs/swagger';
import { CreateContactDto } from './create-contact.dto';

// Partial DTO for updating contact records.
export class UpdateContactDto extends PartialType(CreateContactDto) {}
