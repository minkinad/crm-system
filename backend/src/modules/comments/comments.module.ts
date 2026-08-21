import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { ContactsModule } from '../contacts/contacts.module';
import { DealsModule } from '../deals/deals.module';
import { TasksModule } from '../tasks/tasks.module';
import { CommentEntity } from './comment.entity';
import { CommentTargetsService } from './comment-targets.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

// Comments module for collaboration features.
@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    AccountsModule,
    ContactsModule,
    DealsModule,
    TasksModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentTargetsService],
  exports: [CommentsService]
})
export class CommentsModule {}
