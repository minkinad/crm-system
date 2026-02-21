import { SetMetadata } from '@nestjs/common';

// Per-route rate limit metadata key.
export const RATE_LIMIT_KEY = 'rate_limit';

// Route-level rate limit settings, backed by Redis.
export const RateLimit = (limit: number, ttlSeconds = 60) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, ttlSeconds });
