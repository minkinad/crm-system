import {
  BadRequestException,
  Injectable,
  NestMiddleware
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { TenantContextService } from '../../modules/tenants/tenant-context.service';

// Binds tenant id to request scope and blocks cross-tenant data access.
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly publicPathSuffixes = new Set([
    '/auth/register',
    '/auth/login',
    '/auth/refresh',
    '/health'
  ]);

  constructor(
    private readonly configService: ConfigService,
    private readonly tenantContext: TenantContextService
  ) {}

  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction): void {
    if ([...this.publicPathSuffixes].some((suffix) => req.path.endsWith(suffix))) {
      this.tenantContext.run({ tenantId: null }, () => next());
      return;
    }

    const headerName = this.configService.get<string>('tenantHeader', 'x-tenant-id');
    const tenantId = req.header(headerName);

    if (!tenantId) {
      throw new BadRequestException(`Missing tenant header: ${headerName}`);
    }

    req.tenantId = tenantId;
    this.tenantContext.run({ tenantId }, () => next());
  }
}
