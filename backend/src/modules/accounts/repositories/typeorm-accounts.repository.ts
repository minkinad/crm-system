import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AccountEntity } from '../account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { AccountsRepository } from './accounts.repository.interface';

// TypeORM repository for accounts with search and pagination support.
@Injectable()
export class TypeOrmAccountsRepository implements AccountsRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>
  ) {}

  async create(tenantId: string, dto: CreateAccountDto): Promise<AccountEntity> {
    return this.repository.save(this.repository.create({ tenantId, ...dto }));
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto
  ): Promise<{ data: AccountEntity[]; total: number }> {
    const where = query.q
      ? { tenantId, name: ILike(`%${query.q}%`) }
      : { tenantId };

    const [data, total] = await this.repository.findAndCount({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { createdAt: 'DESC' }
    });

    return { data, total };
  }

  async findById(tenantId: string, id: string): Promise<AccountEntity | null> {
    return this.repository.findOne({ where: { tenantId, id } });
  }

  async update(tenantId: string, id: string, dto: UpdateAccountDto): Promise<AccountEntity | null> {
    const account = await this.findById(tenantId, id);
    if (!account) {
      return null;
    }
    Object.assign(account, dto);
    return this.repository.save(account);
  }

  async softDelete(tenantId: string, id: string): Promise<void> {
    await this.repository.softDelete({ tenantId, id });
  }
}
