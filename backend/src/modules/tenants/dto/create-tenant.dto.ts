import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

// Tenant creation payload for onboarding.
export class CreateTenantDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsString()
  @Length(3, 80)
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
