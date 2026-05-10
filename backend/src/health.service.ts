import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './database/redis.constants';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis
  ) {}

  getLiveness() {
    return {
      status: 'ok',
      service: 'crm-backend',
      timestamp: new Date().toISOString()
    };
  }

  async getReadiness() {
    const [database, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    const status =
      database.status === 'up' && redis.status === 'up' ? 'ready' : 'degraded';

    return {
      status,
      service: 'crm-backend',
      timestamp: new Date().toISOString(),
      checks: {
        database,
        redis
      }
    };
  }

  private async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'up' as const };
    } catch (error) {
      return {
        status: 'down' as const,
        message: error instanceof Error ? error.message : 'Database is unavailable'
      };
    }
  }

  private async checkRedis() {
    try {
      const response = await this.redis.ping();
      return {
        status: response === 'PONG' ? ('up' as const) : ('down' as const),
        message: response === 'PONG' ? undefined : `Unexpected response: ${response}`
      };
    } catch (error) {
      return {
        status: 'down' as const,
        message: error instanceof Error ? error.message : 'Redis is unavailable'
      };
    }
  }
}
