import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './tenant.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

// Tenant module owns workspace persistence and self-service settings.
@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService]
})
export class TenantsModule {}
