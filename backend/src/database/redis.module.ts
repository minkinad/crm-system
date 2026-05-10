import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisLifecycle } from './redis.lifecycle';

// Redis module provides shared Redis client for caching/rate-limits.
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string>('redis.password') || undefined,
          maxRetriesPerRequest: null
        });
      }
    },
    RedisLifecycle
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule {}
