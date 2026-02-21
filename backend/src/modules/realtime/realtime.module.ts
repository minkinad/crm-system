import { Global, Module } from '@nestjs/common';
import { CrmGateway } from './crm.gateway';
import { RealtimeService } from './realtime.service';

// Global realtime module used by multiple domain services.
@Global()
@Module({
  providers: [CrmGateway, RealtimeService],
  exports: [RealtimeService]
})
export class RealtimeModule {}
