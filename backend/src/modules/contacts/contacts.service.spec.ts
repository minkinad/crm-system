import { NotFoundException } from '@nestjs/common';
import { RealtimeService } from '../realtime/realtime.service';
import { ContactsService } from './contacts.service';
import { ContactsRepository } from './repositories/contacts.repository.interface';

describe('ContactsService deletion', () => {
  const repository = { softDelete: jest.fn() } as unknown as ContactsRepository;
  const realtime = { publish: jest.fn() } as unknown as RealtimeService;
  const service = new ContactsService(repository, realtime);

  beforeEach(() => jest.clearAllMocks());

  it('does not publish a deletion event for a missing contact', async () => {
    jest.mocked(repository.softDelete).mockResolvedValue(false);

    await expect(service.remove('tenant-id', 'contact-id')).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(realtime.publish).not.toHaveBeenCalled();
  });
});
