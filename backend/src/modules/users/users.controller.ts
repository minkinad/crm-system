import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

// Users API with tenant-scoped RBAC controls.
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard, TenantAccessGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Req() req: Request & { tenantId: string }, @Body() dto: CreateUserDto) {
    return this.usersService.create(req.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Req() req: Request & { tenantId: string }) {
    return this.usersService.findAll(req.tenantId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.usersService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.usersService.remove(req.tenantId, id);
  }
}
