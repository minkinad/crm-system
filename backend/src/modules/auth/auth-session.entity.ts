import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity';

// Auth session stores hashed refresh token for rotation and revocation.
@Entity('auth_sessions')
@Index(['tenantId', 'userId'])
export class AuthSessionEntity extends AppBaseEntity {
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ select: false })
  refreshTokenHash!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
