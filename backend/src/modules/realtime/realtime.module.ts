import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSessionEntity } from '../auth/auth-session.entity';
import { CrmGateway } from './crm.gateway';
import { RealtimeService } from './realtime.service';

// Global realtime module used by multiple domain services.
@Global()
@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([AuthSessionEntity])],
  providers: [CrmGateway, RealtimeService],
  exports: [RealtimeService]
})
export class RealtimeModule {}
