import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ready when dependencies respond', async () => {
    const service = new HealthService(
      {
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }])
      } as never,
      {
        ping: jest.fn().mockResolvedValue('PONG')
      } as never
    );

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'ready',
      checks: {
        database: { status: 'up' },
        redis: { status: 'up' }
      }
    });
  });

  it('reports degraded when redis is unavailable', async () => {
    const service = new HealthService(
      {
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }])
      } as never,
      {
        ping: jest.fn().mockRejectedValue(new Error('redis unavailable'))
      } as never
    );

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'degraded',
      checks: {
        database: { status: 'up' },
        redis: { status: 'down', message: 'redis unavailable' }
      }
    });
  });
});
