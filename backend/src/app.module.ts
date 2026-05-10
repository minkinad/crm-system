import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { RedisRateLimitGuard } from './common/guards/redis-rate-limit.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { RedisModule } from './database/redis.module';
import { HealthController } from './health.controller';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthSessionEntity } from './modules/auth/auth-session.entity';
import { CommentEntity } from './modules/comments/comment.entity';
import { CommentsModule } from './modules/comments/comments.module';
import { ContactEntity } from './modules/contacts/contact.entity';
import { ContactsModule } from './modules/contacts/contacts.module';
import { AccountEntity } from './modules/accounts/account.entity';
import { DealEntity } from './modules/deals/deal.entity';
import { DealStageHistoryEntity } from './modules/deals/deal-stage-history.entity';
import { DealsModule } from './modules/deals/deals.module';
import { QueuesModule } from './modules/queues/queues.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { TaskEntity } from './modules/tasks/task.entity';
import { TasksModule } from './modules/tasks/tasks.module';
import { TenantEntity } from './modules/tenants/tenant.entity';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AuditLogEntity } from './modules/audit/audit-log.entity';
import { UserEntity } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';
import { HealthService } from './health.service';

// Root application module composes infrastructure and business modules.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('postgres.host', 'localhost'),
        port: configService.get<number>('postgres.port', 5432),
        username: configService.get<string>('postgres.username', 'crm'),
        password: configService.get<string>('postgres.password', 'crm'),
        database: configService.get<string>('postgres.database', 'crm'),
        autoLoadEntities: true,
        entities: [
          TenantEntity,
          UserEntity,
          AuthSessionEntity,
          AccountEntity,
          ContactEntity,
          DealEntity,
          DealStageHistoryEntity,
          TaskEntity,
          CommentEntity,
          AuditLogEntity
        ],
        synchronize: false,
        logging: configService.get<string>('nodeEnv') !== 'production'
      })
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string>('redis.password') || undefined
        }
      })
    }),
    RedisModule,
    RealtimeModule,
    QueuesModule,
    AuditModule,
    TenantsModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    ContactsModule,
    DealsModule,
    TasksModule,
    CommentsModule
  ],
  controllers: [HealthController],
  providers: [HealthService,
    {
      provide: APP_GUARD,
      useClass: RedisRateLimitGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, TenantMiddleware, CsrfMiddleware).forRoutes('*');
  }
}
