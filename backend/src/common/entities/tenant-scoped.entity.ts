import { Column, Index } from 'typeorm';
import { AppBaseEntity } from './base.entity';

// Base for every tenant-scoped table to enforce strict tenant isolation.
export abstract class TenantScopedEntity extends AppBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;
}
