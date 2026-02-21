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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

// Tasks API endpoints.
@ApiTags('Tasks')
@Controller({ path: 'tasks', version: '1' })
@UseGuards(JwtAuthGuard, TenantAccessGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@Req() req: Request & { tenantId: string }, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findAll(@Req() req: Request & { tenantId: string }, @Query() query: QueryTasksDto) {
    return this.tasksService.findAll(req.tenantId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findById(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.tasksService.findById(req.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto
  ) {
    return this.tasksService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.tasksService.remove(req.tenantId, id);
  }
}
