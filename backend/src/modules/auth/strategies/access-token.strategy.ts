import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../../common/constants/roles';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';

interface AccessPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: Role;
  sessionId: string;
}

// JWT access token strategy for short-lived stateless authentication.
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret')
    });
  }

  async validate(payload: AccessPayload): Promise<AuthenticatedUser> {
    if (!payload.tenantId) {
      throw new UnauthorizedException('Tenant is missing in token payload');
    }

    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId
    };
  }
}
