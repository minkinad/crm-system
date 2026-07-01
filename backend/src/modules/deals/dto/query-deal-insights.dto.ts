import { IsOptional, IsString, IsUUID } from 'class-validator';

// Query DTO for the sales cockpit analytics endpoint.
export class QueryDealInsightsDto {
  @IsOptional()
  @IsString()
  pipeline?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
