import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/constants/roles';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { UuidParam } from '../../common/decorators/uuid-param.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

// Users API with tenant-scoped RBAC controls.
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@TenantId() tenantId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@TenantId() tenantId: string) {
    return this.usersService.findAll(tenantId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @TenantId() tenantId: string,
    @UuidParam() id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser
  ) {
    return this.usersService.update(tenantId, id, dto, actor.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(
    @TenantId() tenantId: string,
    @UuidParam() id: string,
    @CurrentUser() actor: AuthenticatedUser
  ) {
    return this.usersService.remove(tenantId, id, actor.userId);
  }
}
