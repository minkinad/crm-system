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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
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
  @Roles(Role.ADMIN)
  create(@Req() req: Request & { tenantId: string }, @Body() dto: CreateUserDto) {
    return this.usersService.create(req.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Req() req: Request & { tenantId: string }) {
    return this.usersService.findAll(req.tenantId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser
  ) {
    return this.usersService.update(req.tenantId, id, dto, actor.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser
  ) {
    return this.usersService.remove(req.tenantId, id, actor.userId);
  }
}
