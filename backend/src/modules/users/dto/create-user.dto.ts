import { IsEmail, IsEnum, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { Role } from '../../../common/constants/roles';

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
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
