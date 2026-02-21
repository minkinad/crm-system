import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toCsv } from '../../common/utils/csv.util';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { DealStageHistoryEntity } from './deal-stage-history.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DEALS_REPOSITORY, DealsRepository } from './repositories/deals.repository.interface';

// Deals service handles pipeline transitions and history tracking.
@Injectable()
export class DealsService {
  constructor(
    @Inject(DEALS_REPOSITORY)
    private readonly dealsRepository: DealsRepository,
    @InjectRepository(DealStageHistoryEntity)
    private readonly historyRepository: Repository<DealStageHistoryEntity>,
    private readonly realtimeService: RealtimeService
  ) {}

  async create(tenantId: string, dto: CreateDealDto, actorId?: string) {
    const deal = await this.dealsRepository.create(tenantId, dto);
    await this.historyRepository.save(
      this.historyRepository.create({
        tenantId,
        dealId: deal.id,
        fromStage: null,
        toStage: deal.stage,
        changedBy: actorId ?? null
      })
    );
    this.realtimeService.publish(tenantId, 'deals.created', { id: deal.id, stage: deal.stage });
    return deal;
  }

  findAll(tenantId: string, query: QueryDealsDto) {
    return this.dealsRepository.findAll(tenantId, query);
  }

  async findById(tenantId: string, id: string) {
    const deal = await this.dealsRepository.findById(tenantId, id);
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    return deal;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateDealDto,
    actor?: AuthenticatedUser
  ) {
    const existing = await this.findById(tenantId, id);
    const updated = await this.dealsRepository.update(tenantId, id, dto);
    if (!updated) {
      throw new NotFoundException('Deal not found');
    }

    if (dto.stage && dto.stage !== existing.stage) {
      await this.historyRepository.save(
        this.historyRepository.create({
          tenantId,
          dealId: updated.id,
          fromStage: existing.stage,
          toStage: dto.stage,
          changedBy: actor?.userId ?? null
        })
      );
    }

    this.realtimeService.publish(tenantId, 'deals.updated', {
      id: updated.id,
      stage: updated.stage,
      status: updated.status
    });
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.dealsRepository.softDelete(tenantId, id);
    this.realtimeService.publish(tenantId, 'deals.deleted', { id });
  }

  async getStageHistory(tenantId: string, dealId: string) {
    return this.historyRepository.find({
      where: { tenantId, dealId },
      order: { createdAt: 'DESC' }
    });
  }

  async exportCsv(tenantId: string, query: QueryDealsDto): Promise<string> {
    const { data } = await this.dealsRepository.findAll(tenantId, {
      ...query,
      page: 1,
      limit: 1000
    });

    return toCsv(
      data.map((deal) => ({
        id: deal.id,
        title: deal.title,
        value: deal.value,
        currency: deal.currency,
        stage: deal.stage,
        status: deal.status,
        pipeline: deal.pipeline,
        expectedCloseDate: deal.expectedCloseDate,
        ownerId: deal.ownerId,
        accountId: deal.accountId,
        contactId: deal.contactId,
        createdAt: deal.createdAt.toISOString()
      }))
    );
  }
}
