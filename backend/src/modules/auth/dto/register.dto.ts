import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

// DTO for tenant onboarding with initial admin user.
export class RegisterDto {
  @IsString()
  @Length(2, 120)
  tenantName!: string;

  @IsString()
  @Length(3, 80)
  @Matches(/^[a-z0-9-]+$/)
  tenantSlug!: string;

  @IsString()
  @Length(2, 120)
  firstName!: string;

  @IsString()
  @Length(2, 120)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
