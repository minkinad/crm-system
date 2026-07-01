import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealInsightsDto } from './dto/query-deal-insights.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealsService } from './deals.service';

// Deals API for pipeline management and stage history retrieval.
@ApiTags('Deals')
@Controller({ path: 'deals', version: '1' })
@UseGuards(JwtAuthGuard, TenantAccessGuard, RolesGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(
    @Req() req: Request & { tenantId: string },
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDealDto
  ) {
    return this.dealsService.create(req.tenantId, dto, user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findAll(@Req() req: Request & { tenantId: string }, @Query() query: QueryDealsDto) {
    return this.dealsService.findAll(req.tenantId, query);
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="deals.csv"')
  @Roles(Role.ADMIN, Role.MANAGER)
  exportCsv(@Req() req: Request & { tenantId: string }, @Query() query: QueryDealsDto) {
    return this.dealsService.exportCsv(req.tenantId, query);
  }

  @Get('analytics/summary')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  analytics(@Req() req: Request & { tenantId: string }, @Query() query: QueryDealInsightsDto) {
    return this.dealsService.getPipelineInsights(req.tenantId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findById(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.dealsService.findById(req.tenantId, id);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  history(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.dealsService.getStageHistory(req.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(
    @Req() req: Request & { tenantId: string },
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto
  ) {
    return this.dealsService.update(req.tenantId, id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.dealsService.remove(req.tenantId, id);
  }
}
