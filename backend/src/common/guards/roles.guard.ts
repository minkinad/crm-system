import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_PRIORITY, Role } from '../constants/roles';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

// RBAC guard that supports role priority checks.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new UnauthorizedException('User context is missing');
    }

    const userPriority = ROLE_PRIORITY[user.role];
    return requiredRoles.some((role) => userPriority >= ROLE_PRIORITY[role]);
  }
}
