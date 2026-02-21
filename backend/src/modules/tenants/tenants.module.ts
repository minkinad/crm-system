import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantContextService } from './tenant-context.service';
import { TenantEntity } from './tenant.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

// Tenant module exposes tenant context globally for isolation middleware and services.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantContextService, TenantsService],
  controllers: [TenantsController],
  exports: [TenantContextService, TenantsService]
})
export class TenantsModule {}
