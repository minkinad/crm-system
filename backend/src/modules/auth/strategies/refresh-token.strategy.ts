import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from '../../../common/constants/roles';

interface RefreshPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: Role;
  sessionId: string;
}

// Refresh strategy validates long-lived refresh JWT from secure cookie.
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private readonly refreshCookieName: string;

  constructor(private readonly configService: ConfigService) {
    const refreshCookieName = configService.get<string>('jwt.refreshCookieName') ?? 'crm_refresh_token';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          return request?.cookies?.[refreshCookieName] ?? null;
        }
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow<string>('jwt.refreshSecret')
    });
    this.refreshCookieName = refreshCookieName;
  }

  async validate(
    req: Request,
    payload: RefreshPayload
  ): Promise<RefreshPayload & { refreshToken: string }> {
    const refreshToken = req.cookies?.[this.refreshCookieName];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return {
      ...payload,
      refreshToken
    };
  }
}
