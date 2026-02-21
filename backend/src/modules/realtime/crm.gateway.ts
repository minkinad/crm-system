import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Socket gateway broadcasts tenant-scoped realtime CRM events.
@WebSocketGateway({
  namespace: '/crm',
  cors: {
    origin: true,
    credentials: true
  }
})
export class CrmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CrmGateway.name);

  handleConnection(@ConnectedSocket() client: Socket): void {
    const tenantId = this.extractTenantId(client);
    if (!tenantId) {
      client.disconnect(true);
      return;
    }

    client.join(this.toTenantRoom(tenantId));
    this.logger.debug(`Socket connected: ${client.id}, tenant=${tenantId}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  emitToTenant(tenantId: string, event: string, payload: unknown): void {
    this.server.to(this.toTenantRoom(tenantId)).emit(event, payload);
  }

  private extractTenantId(client: Socket): string | null {
    const fromAuth = client.handshake.auth?.tenantId;
    const fromQuery = client.handshake.query?.tenantId;
    const fromHeader = client.handshake.headers['x-tenant-id'];

    return String(fromAuth ?? fromQuery ?? fromHeader ?? '').trim() || null;
  }

  private toTenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }
}
