import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { DealStage, DealStatus } from '../deal.enums';

// Query DTO for filtering deals by pipeline/stage/status/owner.
export class QueryDealsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  pipeline?: string;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
