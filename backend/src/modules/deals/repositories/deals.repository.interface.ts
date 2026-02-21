import { DealEntity } from '../deal.entity';
import { CreateDealDto } from '../dto/create-deal.dto';
import { QueryDealsDto } from '../dto/query-deals.dto';
import { UpdateDealDto } from '../dto/update-deal.dto';

// Deals repository abstraction for service-level business logic.
export interface DealsRepository {
  create(tenantId: string, dto: CreateDealDto): Promise<DealEntity>;
  findAll(tenantId: string, query: QueryDealsDto): Promise<{ data: DealEntity[]; total: number }>;
  findById(tenantId: string, id: string): Promise<DealEntity | null>;
  update(tenantId: string, id: string, dto: UpdateDealDto): Promise<DealEntity | null>;
  softDelete(tenantId: string, id: string): Promise<void>;
}

// DI token for repository wiring.
export const DEALS_REPOSITORY = Symbol('DEALS_REPOSITORY');
