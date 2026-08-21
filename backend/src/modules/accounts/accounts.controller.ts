import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { UuidParam } from '../../common/decorators/uuid-param.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

// Accounts (companies) management endpoints.
@ApiTags('Accounts')
@Controller({ path: 'accounts', version: '1' })
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@TenantId() tenantId: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.accountsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findById(@TenantId() tenantId: string, @UuidParam() id: string) {
    return this.accountsService.findById(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(@TenantId() tenantId: string, @UuidParam() id: string, @Body() dto: UpdateAccountDto) {
    return this.accountsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@TenantId() tenantId: string, @UuidParam() id: string) {
    return this.accountsService.remove(tenantId, id);
  }
}
