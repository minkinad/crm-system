import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AccountEntity } from '../account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

// Accounts repository abstraction for clean architecture boundaries.
export interface AccountsRepository {
  create(tenantId: string, dto: CreateAccountDto): Promise<AccountEntity>;
  findAll(tenantId: string, query: PaginationQueryDto): Promise<{ data: AccountEntity[]; total: number }>;
  findById(tenantId: string, id: string): Promise<AccountEntity | null>;
  update(tenantId: string, id: string, dto: UpdateAccountDto): Promise<AccountEntity | null>;
  softDelete(tenantId: string, id: string): Promise<void>;
}

// DI token for repository implementation.
export const ACCOUNTS_REPOSITORY = Symbol('ACCOUNTS_REPOSITORY');
