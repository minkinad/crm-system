import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../user.entity';
import { UsersRepository } from './users.repository.interface';

// TypeORM implementation of users repository contract.
@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
  ) {}

  async create(tenantId: string, dto: CreateUserDto, passwordHash: string): Promise<UserEntity> {
    const { firstName, lastName, email, role, isActive } = dto as CreateUserDto & {
      isActive?: boolean;
    };
    const user = this.repository.create({
      firstName,
      lastName,
      tenantId,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isActive
    });
    return this.repository.save(user);
  }

  async findByEmail(tenantId: string, email: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async findById(tenantId: string, id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { tenantId, id } });
  }

  async findAll(tenantId: string): Promise<UserEntity[]> {
    return this.repository.find({ where: { tenantId } });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateUserDto,
    passwordHash?: string
  ): Promise<UserEntity | null> {
    const user = await this.findById(tenantId, id);
    if (!user) {
      return null;
    }

    const { email, firstName, lastName, role, isActive } = dto as UpdateUserDto & {
      isActive?: boolean;
    };
    Object.assign(user, {
      email: email ? email.toLowerCase() : user.email,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      role: role ?? user.role,
      isActive: isActive ?? user.isActive
    });
    if (passwordHash) {
      user.passwordHash = passwordHash;
    }

    return this.repository.save(user);
  }

  async softDelete(tenantId: string, id: string): Promise<void> {
    await this.repository.softDelete({ tenantId, id });
  }
}
