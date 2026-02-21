import { AuthGuard } from '@nestjs/passport';

// Guard for refresh token strategy.
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
