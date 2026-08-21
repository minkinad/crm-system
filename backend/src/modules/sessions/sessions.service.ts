import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { AuthSessionEntity } from './auth-session.entity';

interface SessionIdentity {
  sessionId: string;
  tenantId: string;
  userId: string;
}

export type SessionRotation<T> =
  | { status: 'invalid' }
  | { status: 'reuse' }
  | { status: 'rotated'; value: T };

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(AuthSessionEntity)
    private readonly repository: Repository<AuthSessionEntity>
  ) {}

  create(userId: string, tenantId: string, expiresAt: Date): Promise<AuthSessionEntity> {
    return this.repository.save(
      this.repository.create({
        userId,
        tenantId,
        refreshTokenHash: '',
        expiresAt,
        revokedAt: null
      })
    );
  }

  async bindRefreshToken(session: AuthSessionEntity, refreshToken: string): Promise<void> {
    session.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.repository.save(session);
  }

  async rotate<T extends { refreshToken: string }>(
    identity: SessionIdentity,
    presentedToken: string,
    issueNext: (sessionId: string) => Promise<T>
  ): Promise<SessionRotation<T>> {
    return this.repository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(AuthSessionEntity);
      const session = await repository
        .createQueryBuilder('session')
        .addSelect('session.refreshTokenHash')
        .setLock('pessimistic_write')
        .where('session.id = :id', { id: identity.sessionId })
        .andWhere('session.userId = :userId', { userId: identity.userId })
        .andWhere('session.tenantId = :tenantId', { tenantId: identity.tenantId })
        .getOne();

      if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
        return { status: 'invalid' as const };
      }

      const matches = await bcrypt.compare(presentedToken, session.refreshTokenHash);
      if (!matches) {
        session.revokedAt = new Date();
        await repository.save(session);
        return { status: 'reuse' as const };
      }

      const value = await issueNext(session.id);
      session.refreshTokenHash = await bcrypt.hash(value.refreshToken, 12);
      await repository.save(session);
      return { status: 'rotated' as const, value };
    });
  }

  async revoke(identity: SessionIdentity): Promise<void> {
    await this.repository.update(
      {
        id: identity.sessionId,
        tenantId: identity.tenantId,
        userId: identity.userId,
        revokedAt: IsNull()
      },
      { revokedAt: new Date() }
    );
  }

  async revokeAll(tenantId: string, userId: string): Promise<void> {
    await this.repository.update(
      { tenantId, userId, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
  }

  isActive(identity: SessionIdentity): Promise<boolean> {
    return this.repository.exists({
      where: {
        id: identity.sessionId,
        tenantId: identity.tenantId,
        userId: identity.userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      }
    });
  }
}
