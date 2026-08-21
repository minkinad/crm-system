import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Role } from '../constants/roles';
import { TenantAccessGuard } from './tenant-access.guard';

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request
    })
  } as ExecutionContext;
}

describe('TenantAccessGuard', () => {
  const guard = new TenantAccessGuard();

  it('uses the verified user tenant as the authoritative boundary', () => {
    const request = {
      tenantId: 'attacker-controlled-tenant',
      user: {
        userId: 'user-id',
        tenantId: 'verified-tenant',
        email: 'admin@example.com',
        role: Role.ADMIN,
        sessionId: 'session-id'
      }
    };

    expect(guard.canActivate(contextFor(request))).toBe(true);
    expect(request.tenantId).toBe('verified-tenant');
  });

  it('rejects requests without an authenticated tenant', () => {
    expect(() => guard.canActivate(contextFor({}))).toThrow(UnauthorizedException);
  });
});
