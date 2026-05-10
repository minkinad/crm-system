import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/entities/tenant-scoped.entity';

// Contact entity stores person-level lead/customer data.
@Entity('contacts')
@Index(['tenantId', 'email'])
@Index(['tenantId', 'accountId'])
export class ContactEntity extends TenantScopedEntity {
  @Column({ length: 120 })
  firstName!: string;

  @Column({ length: 120 })
  lastName!: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  position?: string | null;

  @Column({ type: 'uuid', nullable: true })
  accountId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId?: string | null;
}
