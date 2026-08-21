import { Body, Controller, Delete, Get, Header, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { UuidParam } from '../../common/decorators/uuid-param.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealInsightsDto } from './dto/query-deal-insights.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealsService } from './deals.service';

// Deals API for pipeline management and stage history retrieval.
@ApiTags('Deals')
@Controller({ path: 'deals', version: '1' })
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDealDto
  ) {
    return this.dealsService.create(tenantId, dto, user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findAll(@TenantId() tenantId: string, @Query() query: QueryDealsDto) {
    return this.dealsService.findAll(tenantId, query);
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="deals.csv"')
  @Roles(Role.ADMIN, Role.MANAGER)
  exportCsv(@TenantId() tenantId: string, @Query() query: QueryDealsDto) {
    return this.dealsService.exportCsv(tenantId, query);
  }

  @Get('analytics/summary')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  analytics(@TenantId() tenantId: string, @Query() query: QueryDealInsightsDto) {
    return this.dealsService.getPipelineInsights(tenantId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findById(@TenantId() tenantId: string, @UuidParam() id: string) {
    return this.dealsService.findById(tenantId, id);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  history(@TenantId() tenantId: string, @UuidParam() id: string) {
    return this.dealsService.getStageHistory(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UuidParam() id: string,
    @Body() dto: UpdateDealDto
  ) {
    return this.dealsService.update(tenantId, id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@TenantId() tenantId: string, @UuidParam() id: string) {
    return this.dealsService.remove(tenantId, id);
  }
}
