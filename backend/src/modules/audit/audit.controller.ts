import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { QueryAuditDto } from './dto/query-audit.dto';
import { AuditService } from './audit.service';

// Read-only audit trail API.
@ApiTags('Audit')
@Controller({ path: 'audit', version: '1' })
@UseGuards(JwtAuthGuard, TenantAccessGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Req() req: Request & { tenantId: string }, @Query() query: QueryAuditDto) {
    return this.auditService.findAll(req.tenantId, query);
  }
}
