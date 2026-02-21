import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

// Query DTO for audit trail filters.
export class QueryAuditDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;
}
