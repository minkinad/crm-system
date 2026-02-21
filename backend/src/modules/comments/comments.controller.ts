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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

// Comments API endpoints.
@ApiTags('Comments')
@Controller({ path: 'comments', version: '1' })
@UseGuards(JwtAuthGuard, TenantAccessGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(
    @Req() req: Request & { tenantId: string },
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto
  ) {
    return this.commentsService.create(req.tenantId, user.userId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findByTarget(
    @Req() req: Request & { tenantId: string },
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string
  ) {
    return this.commentsService.findByTarget(req.tenantId, targetType, targetId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(
    @Req() req: Request & { tenantId: string },
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto
  ) {
    return this.commentsService.update(req.tenantId, id, user.userId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  remove(
    @Req() req: Request & { tenantId: string },
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return this.commentsService.remove(req.tenantId, id, user.userId);
  }
}
