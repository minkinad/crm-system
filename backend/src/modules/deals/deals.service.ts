import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toCsv } from '../../common/utils/csv.util';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { DealStageHistoryEntity } from './deal-stage-history.entity';
import { DealEntity } from './deal.entity';
import { DealStage, DealStatus } from './deal.enums';
import {
  TASK_ACTIVITY_READER,
  TaskActivityReader
} from '../tasks/task-activity.reader';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealInsightsDto } from './dto/query-deal-insights.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DEALS_REPOSITORY, DealsRepository } from './repositories/deals.repository.interface';

const STAGE_PROBABILITY: Record<DealStage, number> = {
  [DealStage.LEAD]: 0.1,
  [DealStage.QUALIFIED]: 0.25,
  [DealStage.PROPOSAL]: 0.5,
  [DealStage.NEGOTIATION]: 0.75,
  [DealStage.WON]: 1,
  [DealStage.LOST]: 0
};

// Deals service handles pipeline transitions and history tracking.
@Injectable()
export class DealsService {
  constructor(
    @Inject(DEALS_REPOSITORY)
    private readonly dealsRepository: DealsRepository,
    @InjectRepository(DealStageHistoryEntity)
    private readonly historyRepository: Repository<DealStageHistoryEntity>,
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @Inject(TASK_ACTIVITY_READER)
    private readonly taskActivityReader: TaskActivityReader,
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

  async getPipelineInsights(tenantId: string, query: QueryDealInsightsDto) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const staleSince = new Date(now);
    staleSince.setDate(staleSince.getDate() - 14);

    const baseQb = this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.tenantId = :tenantId', { tenantId });

    if (query.pipeline) {
      baseQb.andWhere('deal.pipeline = :pipeline', { pipeline: query.pipeline });
    }

    if (query.ownerId) {
      baseQb.andWhere('deal.ownerId = :ownerId', { ownerId: query.ownerId });
    }

    const openBaseQb = baseQb
      .clone()
      .andWhere('deal.status = :status', { status: DealStatus.OPEN });

    const stageRows = await openBaseQb
      .clone()
      .select('deal.stage', 'stage')
      .addSelect('deal.currency', 'currency')
      .addSelect('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(deal.value), 0)', 'value')
      .groupBy('deal.stage')
      .addGroupBy('deal.currency')
      .getRawMany<{ stage: DealStage; currency: string; count: number; value: string }>();

    const openDealIdRows = await openBaseQb
      .clone()
      .select('deal.id', 'id')
      .getRawMany<{ id: string }>();
    const openDealIds = openDealIdRows.map((row) => row.id);
    const dealIdsWithOpenTasks = await this.taskActivityReader.findDealIdsWithOpenTasks(
      tenantId,
      openDealIds
    );

    const [staleDeals, overdueCloseDates] = await Promise.all([
      openBaseQb
        .clone()
        .andWhere('deal.updatedAt < :staleSince', { staleSince })
        .getCount(),
      openBaseQb
        .clone()
        .andWhere('deal.expectedCloseDate < :today', { today })
        .getCount()
    ]);
    const dealsWithoutOpenTask = openDealIds.length - dealIdsWithOpenTasks.size;

    const openDeals = await openBaseQb
      .clone()
      .orderBy('deal.updatedAt', 'ASC')
      .take(250)
      .getMany();

    const stageSummary = Object.values(DealStage).map((stage) => {
      const rows = stageRows.filter((row) => row.stage === stage);
      return {
        stage,
        probability: STAGE_PROBABILITY[stage],
        count: rows.reduce((sum, row) => sum + Number(row.count), 0),
        valueByCurrency: this.sumRowsByCurrency(rows)
      };
    });

    const forecastByCurrency = new Map<string, { pipeline: number; weighted: number }>();
    for (const row of stageRows) {
      const current = forecastByCurrency.get(row.currency) ?? { pipeline: 0, weighted: 0 };
      const value = Number(row.value);
      current.pipeline += value;
      current.weighted += value * STAGE_PROBABILITY[row.stage];
      forecastByCurrency.set(row.currency, current);
    }

    const nextActions = openDeals
      .map((deal) => {
        const hasOpenTask = dealIdsWithOpenTasks.has(deal.id);
        const updatedAt = new Date(deal.updatedAt);
        const isStale = updatedAt < staleSince;
        const isOverdue =
          Boolean(deal.expectedCloseDate) &&
          new Date(`${deal.expectedCloseDate}T23:59:59.999Z`).getTime() < now.getTime();

        const reasons = [
          isOverdue ? 'Закрытие просрочено' : null,
          isStale ? 'Нет движения 14+ дней' : null,
          !hasOpenTask ? 'Нет открытого follow-up' : null
        ].filter(Boolean) as string[];

        return {
          id: deal.id,
          title: deal.title,
          stage: deal.stage,
          value: Number(deal.value),
          currency: deal.currency,
          expectedCloseDate: deal.expectedCloseDate,
          priorityScore:
            (isOverdue ? 50 : 0) +
            (isStale ? 30 : 0) +
            (!hasOpenTask ? 20 : 0) +
            STAGE_PROBABILITY[deal.stage] * 10,
          reasons
        };
      })
      .filter((deal) => deal.reasons.length > 0)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 8);

    return {
      generatedAt: now.toISOString(),
      filters: {
        pipeline: query.pipeline ?? null,
        ownerId: query.ownerId ?? null
      },
      probabilityByStage: STAGE_PROBABILITY,
      stageSummary,
      forecastByCurrency: Array.from(forecastByCurrency.entries()).map(([currency, totals]) => ({
        currency,
        pipeline: Math.round(totals.pipeline * 100) / 100,
        weighted: Math.round(totals.weighted * 100) / 100
      })),
      riskCounters: {
        staleDeals,
        overdueCloseDates,
        dealsWithoutOpenTask
      },
      nextActions
    };
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

  private sumRowsByCurrency(rows: Array<{ currency: string; value: string }>) {
    const totals = new Map<string, number>();
    for (const row of rows) {
      totals.set(row.currency, (totals.get(row.currency) ?? 0) + Number(row.value));
    }

    return Array.from(totals.entries()).map(([currency, value]) => ({
      currency,
      value: Math.round(value * 100) / 100
    }));
  }
}
