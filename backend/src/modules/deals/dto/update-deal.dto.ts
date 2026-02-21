import { PartialType } from '@nestjs/swagger';
import { CreateDealDto } from './create-deal.dto';

// Partial DTO for updating deal data and stages.
export class UpdateDealDto extends PartialType(CreateDealDto) {}
