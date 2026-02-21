import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

// Accounts (companies) management endpoints.
@ApiTags('Accounts')
@Controller({ path: 'accounts', version: '1' })
@UseGuards(JwtAuthGuard, TenantAccessGuard, RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@Req() req: Request & { tenantId: string }, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(req.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findAll(
    @Req() req: Request & { tenantId: string },
    @Query() query: PaginationQueryDto
  ) {
    return this.accountsService.findAll(req.tenantId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findById(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.accountsService.findById(req.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto
  ) {
    return this.accountsService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.accountsService.remove(req.tenantId, id);
  }
}
