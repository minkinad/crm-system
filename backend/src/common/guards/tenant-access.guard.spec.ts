import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/roles';
import { Public } from '../decorators/public.decorator';
import { TenantAccessGuard } from './tenant-access.guard';

@Public()
class PublicController {}

function contextFor(
  request: Record<string, unknown>,
  controller: object = TenantAccessGuard
): ExecutionContext {
  return {
    getHandler: () => contextFor,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => request
    })
  } as unknown as ExecutionContext;
}

describe('TenantAccessGuard', () => {
  const guard = new TenantAccessGuard(new Reflector());

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

  it('does not require tenant context for explicitly public controllers', () => {
    expect(guard.canActivate(contextFor({}, PublicController))).toBe(true);
  });
});
