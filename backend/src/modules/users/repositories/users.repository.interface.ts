import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../user.entity';

// Repository contract that decouples service layer from persistence details.
export interface UsersRepository {
  create(tenantId: string, dto: CreateUserDto, passwordHash: string): Promise<UserEntity>;
  findByEmail(tenantId: string, email: string): Promise<UserEntity | null>;
  findById(tenantId: string, id: string): Promise<UserEntity | null>;
  findAll(tenantId: string): Promise<UserEntity[]>;
  update(tenantId: string, id: string, dto: UpdateUserDto, passwordHash?: string): Promise<UserEntity | null>;
  softDelete(tenantId: string, id: string): Promise<void>;
}

// Provider token for dependency injection.
export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
