import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  USERS_REPOSITORY,
  UsersRepository
} from './repositories/users.repository.interface';
import { UserEntity } from './user.entity';

// Users service implements business logic and enforces uniqueness/security rules.
@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository
  ) {}

  async create(tenantId: string, dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.usersRepository.findByEmail(tenantId, dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.usersRepository.create(tenantId, dto, passwordHash);
  }

  async findByEmail(tenantId: string, email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(tenantId, email);
  }

  async findById(tenantId: string, id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(tenantId, id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(tenantId: string): Promise<UserEntity[]> {
    return this.usersRepository.findAll(tenantId);
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto): Promise<UserEntity> {
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 12);
    }

    const updated = await this.usersRepository.update(tenantId, id, dto, passwordHash);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.usersRepository.softDelete(tenantId, id);
  }
}
