import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

// DTO for creating company account records.
export class CreateAccountDto {
  @IsString()
  @Length(2, 180)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  industry?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
