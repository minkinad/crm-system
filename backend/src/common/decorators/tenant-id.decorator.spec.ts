import { UnauthorizedException } from '@nestjs/common';
import { readTenantId } from './tenant-id.decorator';

describe('readTenantId', () => {
  it('returns the server-owned tenant context', () => {
    expect(readTenantId({ tenantId: 'tenant-id' })).toBe('tenant-id');
  });

  it('fails closed when the tenant guard did not populate context', () => {
    expect(() => readTenantId({})).toThrow(UnauthorizedException);
  });
});
