import { Column, Entity, Index } from 'typeorm';
import { Role } from '../../common/constants/roles';
import { TenantScopedEntity } from '../../common/entities/tenant-scoped.entity';

// User entity stores credentials and role assignment inside tenant scope.
@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class UserEntity extends TenantScopedEntity {
  @Column({ length: 120 })
  firstName!: string;

  @Column({ length: 120 })
  lastName!: string;

  @Column({ length: 180 })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.VIEWER
  })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;
}
