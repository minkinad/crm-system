import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  ACCOUNTS_REPOSITORY,
  AccountsRepository
} from './repositories/accounts.repository.interface';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

// Account service manages company CRUD use-cases.
@Injectable()
export class AccountsService {
  constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: AccountsRepository,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis
  ) {}

  async create(tenantId: string, dto: CreateAccountDto) {
    const created = await this.accountsRepository.create(tenantId, dto);
    await this.bumpCacheVersion(tenantId);
    return created;
  }

  async findAll(tenantId: string, query: PaginationQueryDto) {
    const version = await this.getCacheVersion(tenantId);
    const cacheKey = `accounts:list:v${version}:${tenantId}:${query.page}:${query.limit}:${query.q ?? ''}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Awaited<ReturnType<AccountsRepository['findAll']>>;
    }

    const data = await this.accountsRepository.findAll(tenantId, query);
    await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 60);
    return data;
  }

  async findById(tenantId: string, id: string) {
    const account = await this.accountsRepository.findById(tenantId, id);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(tenantId: string, id: string, dto: UpdateAccountDto) {
    const updated = await this.accountsRepository.update(tenantId, id, dto);
    if (!updated) {
      throw new NotFoundException('Account not found');
    }
    await this.bumpCacheVersion(tenantId);
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.accountsRepository.softDelete(tenantId, id);
    await this.bumpCacheVersion(tenantId);
  }

  private async getCacheVersion(tenantId: string): Promise<number> {
    const versionKey = `accounts:list:version:${tenantId}`;
    const current = await this.redis.get(versionKey);
    if (!current) {
      await this.redis.set(versionKey, '1');
      return 1;
    }
    return Number(current);
  }

  private async bumpCacheVersion(tenantId: string): Promise<void> {
    const versionKey = `accounts:list:version:${tenantId}`;
    await this.redis.incr(versionKey);
  }
}
