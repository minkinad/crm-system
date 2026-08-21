import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSessionEntity } from './auth-session.entity';
import { SessionsService } from './sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthSessionEntity])],
  providers: [SessionsService],
  exports: [SessionsService]
})
export class SessionsModule {}
