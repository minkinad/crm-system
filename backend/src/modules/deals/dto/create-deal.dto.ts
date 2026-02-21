import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Length
} from 'class-validator';
import { DealStage, DealStatus } from '../deal.enums';

// DTO for creating deals in sales pipelines.
export class CreateDealDto {
  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsNumberString()
  value?: string;

  @IsOptional()
  @IsString()
  @Length(3, 8)
  currency?: string;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  pipeline?: string;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
