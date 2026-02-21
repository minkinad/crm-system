import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

// Partial payload for tenant updates.
export class UpdateTenantDto extends PartialType(CreateTenantDto) {}
