import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RealtimeService } from '../realtime/realtime.service';
import { TaskActivityReader } from '../tasks/task-activity.reader';
import { DealStageHistoryEntity } from './deal-stage-history.entity';
import { DealEntity } from './deal.entity';
import { DealsService } from './deals.service';
import { DealsRepository } from './repositories/deals.repository.interface';

describe('DealsService resource invariants', () => {
  const repository = {
    softDelete: jest.fn(),
    findById: jest.fn()
  } as unknown as DealsRepository;
  const historyRepository = { find: jest.fn() } as unknown as Repository<DealStageHistoryEntity>;
  const dealRepository = {} as Repository<DealEntity>;
  const taskActivityReader = {} as TaskActivityReader;
  const realtime = { publish: jest.fn() } as unknown as RealtimeService;
  const service = new DealsService(
    repository,
    historyRepository,
    dealRepository,
    taskActivityReader,
    realtime
  );

  beforeEach(() => jest.clearAllMocks());

  it('does not publish a deletion event for a missing deal', async () => {
    jest.mocked(repository.softDelete).mockResolvedValue(false);

    await expect(service.remove('tenant-id', 'deal-id')).rejects.toBeInstanceOf(NotFoundException);
    expect(realtime.publish).not.toHaveBeenCalled();
  });

  it('does not expose stage history for a missing or foreign deal', async () => {
    jest.mocked(repository.findById).mockResolvedValue(null);

    await expect(service.getStageHistory('tenant-id', 'deal-id')).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(historyRepository.find).not.toHaveBeenCalled();
  });
});
