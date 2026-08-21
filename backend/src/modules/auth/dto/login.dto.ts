import { IsByteLength, IsEmail, IsString } from 'class-validator';
import { PASSWORD_MAX_BYTES, PASSWORD_MIN_BYTES } from '../../../common/constants/password-policy';

// DTO for tenant-aware login.
export class LoginDto {
  @IsString()
  tenantSlug!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsByteLength(PASSWORD_MIN_BYTES, PASSWORD_MAX_BYTES)
  password!: string;
}
