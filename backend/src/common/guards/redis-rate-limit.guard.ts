import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';
import { REDIS_CLIENT } from '../../database/redis.constants';

// Redis-backed rate limiting guard for API abuse protection.
@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  private static readonly INCREMENT_SCRIPT = `
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return { count, redis.call('TTL', KEYS[1]) }
  `;

  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redis: Redis
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
    const route = `${request.baseUrl ?? ''}${request.route?.path ?? request.path}`;
    const key = `rate_limit:${tenantId}:${ip}:${route}`;

    let count: number;
    let ttlSeconds: number;
    try {
      const result = (await this.redis.eval(
        RedisRateLimitGuard.INCREMENT_SCRIPT,
        1,
        key,
        routeSettings.ttlSeconds
      )) as [number, number];
      [count, ttlSeconds] = result;
    } catch {
      throw new ServiceUnavailableException('Rate limiting service is unavailable');
    }

    const response = context.switchToHttp().getResponse();
    response.setHeader('RateLimit-Limit', routeSettings.limit);
    response.setHeader('RateLimit-Remaining', Math.max(routeSettings.limit - count, 0));
    response.setHeader('RateLimit-Reset', Math.max(ttlSeconds, 0));

    if (count > routeSettings.limit) {
      response.setHeader('Retry-After', Math.max(ttlSeconds, 1));
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
