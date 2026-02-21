import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from './audit.controller';
import { AuditLogEntity } from './audit-log.entity';
import { AuditService } from './audit.service';

// Global module because audit service is used by global interceptor.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService]
})
export class AuditModule {}
