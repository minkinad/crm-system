import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

// DTO for creating contacts.
export class CreateContactDto {
  @IsString()
  @Length(2, 120)
  firstName!: string;

  @IsString()
  @Length(2, 120)
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(5, 60)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  position?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
