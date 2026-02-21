import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity';

// Immutable audit event record for compliance and forensic analysis.
@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
export class AuditLogEntity extends AppBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  tenantId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ length: 200 })
  action!: string;

  @Column({ length: 200 })
  resource!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;
}
