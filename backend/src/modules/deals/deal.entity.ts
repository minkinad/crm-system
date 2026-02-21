import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/entities/tenant-scoped.entity';
import { DealStage, DealStatus } from './deal.enums';

// Deal aggregate representing commercial opportunity.
@Entity('deals')
@Index(['tenantId', 'stage'])
@Index(['tenantId', 'pipeline'])
export class DealEntity extends TenantScopedEntity {
  @Column({ length: 180 })
  title!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  value!: string;

  @Column({ length: 8, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: DealStage,
    default: DealStage.LEAD
  })
  stage!: DealStage;

  @Column({
    type: 'enum',
    enum: DealStatus,
    default: DealStatus.OPEN
  })
  status!: DealStatus;

  @Column({ length: 80, default: 'Default' })
  pipeline!: string;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate?: string | null;

  @Column({ type: 'uuid', nullable: true })
  accountId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  contactId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;
}
