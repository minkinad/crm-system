import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  TooManyRequestsException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

// Redis-backed rate limiting guard for API abuse protection.
@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const routeSettings =
      this.reflector.get<{ limit: number; ttlSeconds: number }>(
        RATE_LIMIT_KEY,
        context.getHandler()
      ) ?? { limit: 120, ttlSeconds: 60 };

    const tenantId = request.tenantId ?? 'public';
    const ip = request.ip ?? 'unknown';
    const route = request.route?.path ?? request.path;
    const key = `rate_limit:${tenantId}:${ip}:${route}`;

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, routeSettings.ttlSeconds);
    }

    if (count > routeSettings.limit) {
      throw new TooManyRequestsException('Rate limit exceeded');
    }

    return true;
  }
}
