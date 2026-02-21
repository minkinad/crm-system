import { Controller, Get } from '@nestjs/common';

// Health endpoint used by docker healthchecks and uptime monitors.
@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get()
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
