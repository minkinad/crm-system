import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO for tenant-aware login.
export class LoginDto {
  @IsString()
  tenantSlug!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
