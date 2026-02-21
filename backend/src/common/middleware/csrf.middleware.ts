import {
  ForbiddenException,
  Injectable,
  NestMiddleware
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

// Double-submit-cookie CSRF protection for state-changing requests.
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
  private readonly ignoredPathSuffixes = new Set([
    '/auth/login',
    '/auth/register',
    '/auth/refresh'
  ]);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    if (
      this.safeMethods.has(req.method) ||
      [...this.ignoredPathSuffixes].some((suffix) => req.path.endsWith(suffix))
    ) {
      next();
      return;
    }

    const cookieName = this.configService.get<string>('jwt.csrfCookieName', 'crm_csrf_token');
    const cookieToken = req.cookies?.[cookieName];
    const headerToken = req.header('x-csrf-token');

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('CSRF token validation failed');
    }

    next();
  }
}
