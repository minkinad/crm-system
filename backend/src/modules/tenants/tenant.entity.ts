import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity';

// Tenant is the top-level SaaS boundary for all CRM data.
@Entity('tenants')
@Index(['slug'], { unique: true })
export class TenantEntity extends AppBaseEntity {
  @Column({ length: 120 })
  name!: string;

  @Column({ length: 80 })
  slug!: string;

  @Column({ default: true })
  isActive!: boolean;
}
