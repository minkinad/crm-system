import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// Generic pagination DTO used by list endpoints.
export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  q?: string;
}
