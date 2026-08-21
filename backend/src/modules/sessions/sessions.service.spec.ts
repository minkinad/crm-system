import * as bcrypt from 'bcrypt';
import { EntityManager, Repository } from 'typeorm';
import { AuthSessionEntity } from './auth-session.entity';
import { SessionsService } from './sessions.service';

describe('SessionsService token rotation', () => {
  const queryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn()
  };
  const transactionalRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    save: jest.fn()
  };
  const manager = {
    getRepository: jest.fn().mockReturnValue(transactionalRepository)
  } as unknown as EntityManager;
  const repository = {
    manager: {
      transaction: jest.fn((work: (entityManager: EntityManager) => Promise<unknown>) =>
        work(manager)
      )
    }
  } as unknown as Repository<AuthSessionEntity>;
  const service = new SessionsService(repository);
  const identity = {
    sessionId: 'session-id',
    tenantId: 'tenant-id',
    userId: 'user-id'
  };

  beforeEach(() => jest.clearAllMocks());

  it('rotates a valid refresh token while holding the session row lock', async () => {
    const session = {
      id: identity.sessionId,
      refreshTokenHash: await bcrypt.hash('current-token', 4),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null
    } as AuthSessionEntity;
    queryBuilder.getOne.mockResolvedValue(session);
    const issueNext = jest.fn().mockResolvedValue({ refreshToken: 'next-token' });

    const result = await service.rotate(identity, 'current-token', issueNext);

    expect(result).toEqual({ status: 'rotated', value: { refreshToken: 'next-token' } });
    expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(issueNext).toHaveBeenCalledWith(identity.sessionId);
    await expect(bcrypt.compare('next-token', session.refreshTokenHash)).resolves.toBe(true);
    expect(transactionalRepository.save).toHaveBeenCalledWith(session);
  });

  it('revokes the session when refresh-token reuse is detected', async () => {
    const session = {
      id: identity.sessionId,
      refreshTokenHash: await bcrypt.hash('current-token', 4),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null
    } as AuthSessionEntity;
    queryBuilder.getOne.mockResolvedValue(session);
    const issueNext = jest.fn();

    const result = await service.rotate(identity, 'stale-token', issueNext);

    expect(result).toEqual({ status: 'reuse' });
    expect(session.revokedAt).toBeInstanceOf(Date);
    expect(transactionalRepository.save).toHaveBeenCalledWith(session);
    expect(issueNext).not.toHaveBeenCalled();
  });
});
