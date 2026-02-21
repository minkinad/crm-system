import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/roles';

// Metadata key used by RolesGuard.
export const ROLES_KEY = 'roles';

// Route-level RBAC decorator.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
