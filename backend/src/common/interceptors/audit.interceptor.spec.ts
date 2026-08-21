import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';
import { AuditInterceptor } from './audit.interceptor';

function contextFor(method: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method })
    })
  } as unknown as ExecutionContext;
}

describe('AuditInterceptor', () => {
  const auditService = { write: jest.fn() } as unknown as AuditService;
  const interceptor = new AuditInterceptor(auditService);
  const next = { handle: () => of({ ok: true }) } as CallHandler;

  beforeEach(() => jest.clearAllMocks());

  it.each(['GET', 'HEAD', 'OPTIONS'])('does not audit safe %s requests', async (method) => {
    await lastValueFrom(interceptor.intercept(contextFor(method), next));

    expect(auditService.write).not.toHaveBeenCalled();
  });
});
