import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '../tasks/task.entity';
import { DealEntity } from './deal.entity';
import { DealStageHistoryEntity } from './deal-stage-history.entity';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { DEALS_REPOSITORY } from './repositories/deals.repository.interface';
import { TypeOrmDealsRepository } from './repositories/typeorm-deals.repository';

// Deals module provides pipeline CRUD and historical change tracking.
@Module({
  imports: [TypeOrmModule.forFeature([DealEntity, DealStageHistoryEntity, TaskEntity])],
  controllers: [DealsController],
  providers: [
    DealsService,
    TypeOrmDealsRepository,
    {
      provide: DEALS_REPOSITORY,
      useExisting: TypeOrmDealsRepository
    }
  ],
  exports: [DealsService]
})
export class DealsModule {}
