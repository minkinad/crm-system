import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Role } from '../../common/constants/roles';
import { SessionsService } from '../sessions/sessions.service';

interface AccessPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: Role;
  sessionId: string;
  tokenType: 'access';
  exp: number;
}

// Socket gateway broadcasts tenant-scoped realtime CRM events.
@WebSocketGateway({
  namespace: '/crm',
  cors: {
    origin: true,
    credentials: true
  },
  perMessageDeflate: false,
  maxHttpBufferSize: 64 * 1024
})
export class CrmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CrmGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      this.assertAllowedOrigin(client);
      const payload = await this.verifyAccessToken(client);
      const sessionIsActive = await this.sessionsService.isActive({
        sessionId: payload.sessionId,
        tenantId: payload.tenantId,
        userId: payload.sub
      });

      if (!sessionIsActive) {
        throw new Error('Session is inactive');
      }

      client.data.user = payload;
      await client.join(this.toTenantRoom(payload.tenantId));
      const expiresInMs = Math.max(payload.exp * 1000 - Date.now(), 0);
      const expirationTimer = setTimeout(() => client.disconnect(true), expiresInMs);
      expirationTimer.unref();
      client.data.expirationTimer = expirationTimer;
      this.logger.debug(`Socket connected: ${client.id}, tenant=${payload.tenantId}`);
    } catch {
      this.logger.warn(`Rejected unauthenticated socket: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const expirationTimer = client.data.expirationTimer as NodeJS.Timeout | undefined;
    if (expirationTimer) {
      clearTimeout(expirationTimer);
    }
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  emitToTenant(tenantId: string, event: string, payload: unknown): void {
    this.server.to(this.toTenantRoom(tenantId)).emit(event, payload);
  }

  private assertAllowedOrigin(client: Socket): void {
    const origin = client.handshake.headers.origin;
    const allowedOrigins = this.configService.get<string[]>('corsOrigins', []);

    if (origin && !allowedOrigins.includes(origin)) {
      throw new Error('Origin is not allowed');
    }
  }

  private async verifyAccessToken(client: Socket): Promise<AccessPayload> {
    const accessToken = client.handshake.auth?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('Access token is missing');
    }

    const payload = await this.jwtService.verifyAsync<AccessPayload>(accessToken, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      issuer: this.configService.getOrThrow<string>('jwt.issuer'),
      audience: this.configService.getOrThrow<string>('jwt.audience'),
      algorithms: ['HS256']
    });

    if (
      payload.tokenType !== 'access' ||
      !payload.sub ||
      !payload.tenantId ||
      !payload.sessionId ||
      !payload.exp
    ) {
      throw new Error('Access token payload is invalid');
    }

    return payload;
  }

  private toTenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }
}
