import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/entities/tenant-scoped.entity';
import { DealStage } from './deal.enums';

// Immutable log of deal stage transitions for auditability and analytics.
@Entity('deal_stage_history')
@Index(['tenantId', 'dealId'])
export class DealStageHistoryEntity extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  dealId!: string;

  @Column({
    type: 'enum',
    enum: DealStage,
    nullable: true
  })
  fromStage?: DealStage | null;

  @Column({
    type: 'enum',
    enum: DealStage
  })
  toStage!: DealStage;

  @Column({ type: 'uuid', nullable: true })
  changedBy?: string | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;
}
