import {
  Body,
  Controller,
  Get,
  Patch,
  Req
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

// Tenant administration endpoints.
@ApiTags('Tenants')
@Controller({ path: 'tenants', version: '1' })
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  @Roles(Role.ADMIN)
  findCurrent(@Req() req: Request & { tenantId: string }) {
    return this.tenantsService.findById(req.tenantId);
  }

  @Patch('current')
  @Roles(Role.ADMIN)
  updateCurrent(
    @Req() req: Request & { tenantId: string },
    @Body() dto: UpdateTenantDto
  ) {
    return this.tenantsService.update(req.tenantId, dto);
  }
}
