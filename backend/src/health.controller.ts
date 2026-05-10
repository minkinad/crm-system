import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

// Health endpoints expose liveness and dependency readiness for orchestration.
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  ping() {
    return this.healthService.getLiveness();
  }

  @Get('live')
  live() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  async ready() {
    const readiness = await this.healthService.getReadiness();
    if (readiness.status !== 'ready') {
      throw new ServiceUnavailableException(readiness);
    }

    return readiness;
  }
}
