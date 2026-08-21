import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { Role } from '../../common/constants/roles';
import { AuthSessionEntity } from '../auth/auth-session.entity';
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
    private readonly usersRepository: UsersRepository,
    @InjectRepository(AuthSessionEntity)
    private readonly authSessionRepository: Repository<AuthSessionEntity>
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

  async update(
    tenantId: string,
    id: string,
    dto: UpdateUserDto,
    actorId: string
  ): Promise<UserEntity> {
    const current = await this.findById(tenantId, id);
    if (id === actorId && (dto.isActive === false || (dto.role && dto.role !== Role.ADMIN))) {
      throw new BadRequestException('You cannot deactivate or demote your own account');
    }

    if (
      current.role === Role.ADMIN &&
      (dto.isActive === false || (dto.role && dto.role !== Role.ADMIN))
    ) {
      await this.assertAnotherActiveAdminExists(tenantId, id);
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 12);
    }

    const updated = await this.usersRepository.update(tenantId, id, dto, passwordHash);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    if (dto.password || dto.isActive === false) {
      await this.authSessionRepository.update(
        { tenantId, userId: id, revokedAt: IsNull() },
        { revokedAt: new Date() }
      );
    }

    return updated;
  }

  async remove(tenantId: string, id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const current = await this.findById(tenantId, id);
    if (current.role === Role.ADMIN && current.isActive) {
      await this.assertAnotherActiveAdminExists(tenantId, id);
    }

    await this.authSessionRepository.update(
      { tenantId, userId: id, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
    await this.usersRepository.softDelete(tenantId, id);
  }

  private async assertAnotherActiveAdminExists(tenantId: string, excludedId: string): Promise<void> {
    const users = await this.usersRepository.findAll(tenantId);
    const hasAnotherAdmin = users.some(
      (user) => user.id !== excludedId && user.role === Role.ADMIN && user.isActive
    );
    if (!hasAnotherAdmin) {
      throw new BadRequestException('At least one active administrator is required');
    }
  }
}
