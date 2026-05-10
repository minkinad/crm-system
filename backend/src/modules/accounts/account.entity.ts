import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/entities/tenant-scoped.entity';

// Account (company) aggregate root used for B2B CRM relationships.
@Entity('accounts')
@Index(['tenantId', 'name'])
export class AccountEntity extends TenantScopedEntity {
  @Column({ length: 180 })
  name!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  industry?: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  website?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;
}
