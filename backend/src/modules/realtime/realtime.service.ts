import { Injectable } from '@nestjs/common';
import { CrmGateway } from './crm.gateway';

// Service abstraction that hides gateway details from business services.
@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: CrmGateway) {}

  publish(tenantId: string, event: string, payload: unknown): void {
    this.gateway.emitToTenant(tenantId, event, payload);
  }
}
