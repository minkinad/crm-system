import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

// Comments module for collaboration features.
@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService]
})
export class CommentsModule {}
