import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { ContactsService } from '../contacts/contacts.service';
import { DealsService } from '../deals/deals.service';
import { TasksService } from '../tasks/tasks.service';
import { CommentTargetType } from './comment.enums';

// Resolves polymorphic comment targets through module-owned application services.
@Injectable()
export class CommentTargetsService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly contactsService: ContactsService,
    private readonly dealsService: DealsService,
    private readonly tasksService: TasksService
  ) {}

  async assertExists(tenantId: string, targetType: CommentTargetType, targetId: string) {
    const exists = await this.targetExists(tenantId, targetType, targetId);
    if (!exists) {
      throw new NotFoundException('Comment target not found');
    }
  }

  private targetExists(
    tenantId: string,
    targetType: CommentTargetType,
    targetId: string
  ): Promise<boolean> {
    switch (targetType) {
      case CommentTargetType.ACCOUNT:
        return this.accountsService.exists(tenantId, targetId);
      case CommentTargetType.CONTACT:
        return this.contactsService.exists(tenantId, targetId);
      case CommentTargetType.DEAL:
        return this.dealsService.exists(tenantId, targetId);
      case CommentTargetType.TASK:
        return this.tasksService.exists(tenantId, targetId);
    }
  }
}
