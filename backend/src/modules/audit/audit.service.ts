import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryAuditDto } from './dto/query-audit.dto';
import { AuditLogEntity } from './audit-log.entity';

// Audit service persists and reads immutable action logs.
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repository: Repository<AuditLogEntity>
  ) {}

  async write(event: {
    tenantId?: string | null;
    userId?: string | null;
    action: string;
    resource: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const entity = this.repository.create(event);
    await this.repository.save(entity);
  }

  async findAll(tenantId: string, query: QueryAuditDto) {
    const qb = this.repository
      .createQueryBuilder('audit')
      .where('audit.tenantId = :tenantId', { tenantId })
      .orderBy('audit.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (query.userId) {
      qb.andWhere('audit.userId = :userId', { userId: query.userId });
    }

    if (query.action) {
      qb.andWhere('audit.action ILIKE :action', { action: `%${query.action}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
