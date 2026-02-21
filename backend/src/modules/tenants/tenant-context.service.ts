import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

// Tenant context storage to keep tenant id available across async calls.
@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<{ tenantId: string | null }>();

  run(context: { tenantId: string | null }, callback: () => void): void {
    this.storage.run(context, callback);
  }

  getTenantId(): string | null {
    return this.storage.getStore()?.tenantId ?? null;
  }
}
