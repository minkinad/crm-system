import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';

// Enforces that authenticated user operates strictly within its tenant boundary.
@Injectable()
export class TenantAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user || !request.tenantId) {
      return true;
    }

    if (request.user.tenantId !== request.tenantId) {
      throw new ForbiddenException('Tenant isolation violation detected');
    }

    return true;
  }
}
