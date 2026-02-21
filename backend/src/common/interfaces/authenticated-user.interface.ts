import { Role } from '../constants/roles';

// Authenticated user payload that gets attached to request context after JWT validation.
export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  email: string;
  role: Role;
  sessionId: string;
}
