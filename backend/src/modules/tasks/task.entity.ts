import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity } from '../../common/entities/tenant-scoped.entity';
import { TaskPriority, TaskStatus } from './task.enums';

// Task entity for follow-ups, reminders, and operational activities.
@Entity('tasks')
@Index(['tenantId', 'dueDate'])
@Index(['tenantId', 'ownerId'])
export class TaskEntity extends TenantScopedEntity {
  @Column({ length: 180 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  reminderAt?: Date | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  relatedDealId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  relatedContactId?: string | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.OPEN
  })
  status!: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority!: TaskPriority;
}
