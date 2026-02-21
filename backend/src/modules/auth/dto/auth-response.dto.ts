import { Role } from '../../../common/constants/roles';

// Response DTO returned after successful auth operations.
export class AuthResponseDto {
  accessToken!: string;
  accessTokenExpiresIn!: string;
  csrfToken!: string;
  user!: {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
  };
}
