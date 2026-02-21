import { AuthGuard } from '@nestjs/passport';

// Access-token guard for protected endpoints.
export class JwtAuthGuard extends AuthGuard('jwt') {}
