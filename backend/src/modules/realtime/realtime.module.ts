import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SessionsModule } from '../sessions/sessions.module';
import { CrmGateway } from './crm.gateway';
import { RealtimeService } from './realtime.service';

// Global realtime module used by multiple domain services.
@Global()
@Module({
  imports: [JwtModule.register({}), SessionsModule],
  providers: [CrmGateway, RealtimeService],
  exports: [RealtimeService]
})
export class RealtimeModule {}
