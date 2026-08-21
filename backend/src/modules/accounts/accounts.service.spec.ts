import { NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { AccountsService } from './accounts.service';
import { AccountsRepository } from './repositories/accounts.repository.interface';

describe('AccountsService deletion', () => {
  const repository = { softDelete: jest.fn() } as unknown as AccountsRepository;
  const redis = { incr: jest.fn() } as unknown as Redis;
  const service = new AccountsService(repository, redis);

  beforeEach(() => jest.clearAllMocks());

  it('does not invalidate cache for a missing account', async () => {
    jest.mocked(repository.softDelete).mockResolvedValue(false);

    await expect(service.remove('tenant-id', 'account-id')).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(redis.incr).not.toHaveBeenCalled();
  });
});
