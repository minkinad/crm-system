import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSessionEntity } from './auth-session.entity';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

// Auth module composes JWT strategies and session persistence.
@Module({
  imports: [TypeOrmModule.forFeature([AuthSessionEntity]), UsersModule, TenantsModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService]
})
export class AuthModule {}
