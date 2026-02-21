import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

// Query DTO for contact list filters + pagination.
export class QueryContactsDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  accountId?: string;
}
