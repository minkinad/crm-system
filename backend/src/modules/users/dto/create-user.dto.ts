import { IsByteLength, IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role } from '../../../common/constants/roles';
import { PASSWORD_MAX_BYTES, PASSWORD_MIN_BYTES } from '../../../common/constants/password-policy';

// DTO for creating a user by admin or owner.
export class CreateUserDto {
  @IsString()
  @Length(2, 120)
  firstName!: string;

  @IsString()
  @Length(2, 120)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsByteLength(PASSWORD_MIN_BYTES, PASSWORD_MAX_BYTES)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
