import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/entities/tenant-scoped.entity';
import { CommentTargetType } from './comment.enums';

// Comment entity for contextual collaboration across CRM records.
@Entity('comments')
@Index(['tenantId', 'targetType', 'targetId'])
export class CommentEntity extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  authorId!: string;

  @Column({
    type: 'enum',
    enum: CommentTargetType
  })
  targetType!: CommentTargetType;

  @Column({ type: 'uuid' })
  targetId!: string;

  @Column({ type: 'text' })
  body!: string;
}
