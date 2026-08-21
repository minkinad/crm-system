import { NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { ContactsService } from '../contacts/contacts.service';
import { DealsService } from '../deals/deals.service';
import { TasksService } from '../tasks/tasks.service';
import { CommentTargetType } from './comment.enums';
import { CommentTargetsService } from './comment-targets.service';

describe('CommentTargetsService', () => {
  const accountsService = { exists: jest.fn() } as unknown as AccountsService;
  const contactsService = { exists: jest.fn() } as unknown as ContactsService;
  const dealsService = { exists: jest.fn() } as unknown as DealsService;
  const tasksService = { exists: jest.fn() } as unknown as TasksService;
  const service = new CommentTargetsService(
    accountsService,
    contactsService,
    dealsService,
    tasksService
  );

  beforeEach(() => jest.clearAllMocks());

  it('resolves targets through the owning module with tenant scope', async () => {
    jest.mocked(dealsService.exists).mockResolvedValue(true);

    await service.assertExists('tenant-id', CommentTargetType.DEAL, 'deal-id');

    expect(dealsService.exists).toHaveBeenCalledWith('tenant-id', 'deal-id');
    expect(accountsService.exists).not.toHaveBeenCalled();
  });

  it('rejects a target that does not belong to the tenant', async () => {
    jest.mocked(tasksService.exists).mockResolvedValue(false);

    await expect(
      service.assertExists('tenant-id', CommentTargetType.TASK, 'foreign-task-id')
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
