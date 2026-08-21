import { BadRequestException } from '@nestjs/common';
import { Role } from '../../common/constants/roles';
import { SessionsService } from '../sessions/sessions.service';
import { UsersRepository } from './repositories/users.repository.interface';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

function user(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: 'target-id',
    tenantId: 'tenant-id',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
    isActive: true,
    ...overrides
  } as UserEntity;
}

describe('UsersService security invariants', () => {
  const usersRepository = {
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn()
  } as unknown as UsersRepository;
  const sessionsService = {
    revokeAll: jest.fn()
  } as unknown as SessionsService;
  const service = new UsersService(usersRepository, sessionsService);

  beforeEach(() => jest.clearAllMocks());

  it('prevents an administrator from demoting their own account', async () => {
    jest.mocked(usersRepository.findById).mockResolvedValue(user({ id: 'actor-id' }));

    await expect(
      service.update('tenant-id', 'actor-id', { role: Role.MANAGER }, 'actor-id')
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usersRepository.update).not.toHaveBeenCalled();
  });

  it('preserves at least one active administrator', async () => {
    jest.mocked(usersRepository.findById).mockResolvedValue(user());
    jest.mocked(usersRepository.findAll).mockResolvedValue([user()]);

    await expect(
      service.update('tenant-id', 'target-id', { isActive: false }, 'actor-id')
    ).rejects.toThrow('At least one active administrator is required');
  });

  it('revokes active sessions after a password reset', async () => {
    const target = user({ role: Role.SALES });
    jest.mocked(usersRepository.findById).mockResolvedValue(target);
    jest.mocked(usersRepository.update).mockResolvedValue(target);

    await service.update(
      'tenant-id',
      'target-id',
      { password: 'new-secure-password' },
      'actor-id'
    );

    expect(sessionsService.revokeAll).toHaveBeenCalledWith('tenant-id', 'target-id');
  });
});
