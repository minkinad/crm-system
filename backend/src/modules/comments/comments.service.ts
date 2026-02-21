import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './comment.entity';

// Comments service for collaborative discussion features.
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
    private readonly realtimeService: RealtimeService
  ) {}

  async create(tenantId: string, authorId: string, dto: CreateCommentDto) {
    const comment = await this.repository.save(
      this.repository.create({
        tenantId,
        authorId,
        ...dto
      })
    );
    this.realtimeService.publish(tenantId, 'comments.created', {
      id: comment.id,
      targetType: comment.targetType,
      targetId: comment.targetId
    });
    return comment;
  }

  findByTarget(tenantId: string, targetType: string, targetId: string) {
    return this.repository.find({
      where: {
        tenantId,
        targetType: targetType as never,
        targetId
      },
      order: { createdAt: 'DESC' }
    });
  }

  async update(tenantId: string, id: string, authorId: string, dto: UpdateCommentDto) {
    const comment = await this.repository.findOne({ where: { tenantId, id, authorId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    Object.assign(comment, dto);
    const updated = await this.repository.save(comment);
    this.realtimeService.publish(tenantId, 'comments.updated', { id: updated.id });
    return updated;
  }

  async remove(tenantId: string, id: string, authorId: string) {
    const comment = await this.repository.findOne({ where: { tenantId, id, authorId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.repository.softDelete({ tenantId, id });
    this.realtimeService.publish(tenantId, 'comments.deleted', { id });
  }
}
