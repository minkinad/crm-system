import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

type TenantRequest = {
  user?: AuthenticatedUser;
  tenantId?: string;
};

// Derives the tenant boundary from the verified JWT instead of client-controlled input.
@Injectable()
export class TenantAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const user = request.user;

    if (!user?.tenantId) {
      throw new UnauthorizedException('Authenticated tenant context is missing');
    }

    request.tenantId = user.tenantId;
    return true;
  }
}
