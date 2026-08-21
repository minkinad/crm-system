import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../common/constants/roles';
import { SessionsService } from '../sessions/sessions.service';
import { CrmGateway } from './crm.gateway';

function createSocket(overrides: Record<string, unknown> = {}) {
  return {
    id: 'socket-id',
    data: {},
    handshake: {
      auth: { accessToken: 'signed-access-token', tenantId: 'spoofed-tenant' },
      headers: { origin: 'https://crm.example.com' }
    },
    join: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    ...overrides
  };
}

describe('CrmGateway', () => {
  const payload = {
    sub: 'user-id',
    tenantId: 'verified-tenant',
    email: 'admin@example.com',
    role: Role.ADMIN,
    sessionId: 'session-id',
    tokenType: 'access' as const,
    exp: Math.floor(Date.now() / 1000) + 900
  };
  const configService = {
    get: jest.fn().mockReturnValue(['https://crm.example.com']),
    getOrThrow: jest.fn((key: string) => key)
  } as unknown as ConfigService;
  const jwtService = {
    verifyAsync: jest.fn().mockResolvedValue(payload)
  } as unknown as JwtService;
  const sessionsService = {
    isActive: jest.fn().mockResolvedValue(true)
  } as unknown as SessionsService;

  beforeEach(() => jest.clearAllMocks());

  it('joins only the tenant room encoded in the verified JWT', async () => {
    const socket = createSocket();
    const gateway = new CrmGateway(configService, jwtService, sessionsService);

    await gateway.handleConnection(socket as never);

    expect(socket.join).toHaveBeenCalledWith('tenant:verified-tenant');
    expect(socket.join).not.toHaveBeenCalledWith('tenant:spoofed-tenant');
    expect(socket.disconnect).not.toHaveBeenCalled();
  });

  it('rejects a socket from an origin outside the allowlist', async () => {
    const socket = createSocket({
      handshake: {
        auth: { accessToken: 'signed-access-token' },
        headers: { origin: 'https://evil.example' }
      }
    });
    const gateway = new CrmGateway(configService, jwtService, sessionsService);

    await gateway.handleConnection(socket as never);

    expect(socket.join).not.toHaveBeenCalled();
    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });
});
