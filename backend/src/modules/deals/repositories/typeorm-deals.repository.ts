import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { DealEntity } from '../deal.entity';
import { CreateDealDto } from '../dto/create-deal.dto';
import { QueryDealsDto } from '../dto/query-deals.dto';
import { UpdateDealDto } from '../dto/update-deal.dto';
import { DealsRepository } from './deals.repository.interface';

// TypeORM implementation of deals data access.
@Injectable()
export class TypeOrmDealsRepository implements DealsRepository {
  constructor(
    @InjectRepository(DealEntity)
    private readonly repository: Repository<DealEntity>
  ) {}

  create(tenantId: string, dto: CreateDealDto): Promise<DealEntity> {
    return this.repository.save(this.repository.create({ tenantId, ...dto }));
  }

  async findAll(
    tenantId: string,
    query: QueryDealsDto
  ): Promise<{ data: DealEntity[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('deal')
      .where('deal.tenantId = :tenantId', { tenantId });

    if (query.pipeline) {
      qb.andWhere('deal.pipeline = :pipeline', { pipeline: query.pipeline });
    }

    if (query.stage) {
      qb.andWhere('deal.stage = :stage', { stage: query.stage });
    }

    if (query.status) {
      qb.andWhere('deal.status = :status', { status: query.status });
    }

    if (query.ownerId) {
      qb.andWhere('deal.ownerId = :ownerId', { ownerId: query.ownerId });
    }

    if (query.q) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('deal.title ILIKE :q', { q: `%${query.q}%` })
            .orWhere('deal.description ILIKE :q', { q: `%${query.q}%` });
        })
      );
    }

    qb.orderBy('deal.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  findById(tenantId: string, id: string): Promise<DealEntity | null> {
    return this.repository.findOne({ where: { tenantId, id } });
  }

  async update(tenantId: string, id: string, dto: UpdateDealDto): Promise<DealEntity | null> {
    const deal = await this.findById(tenantId, id);
    if (!deal) {
      return null;
    }
    Object.assign(deal, dto);
    return this.repository.save(deal);
  }

  async softDelete(tenantId: string, id: string): Promise<void> {
    await this.repository.softDelete({ tenantId, id });
  }
}
