import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { UuidParam } from '../../common/decorators/uuid-param.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';

// Comments API endpoints.
@ApiTags('Comments')
@Controller({ path: 'comments', version: '1' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto
  ) {
    return this.commentsService.create(tenantId, user.userId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findByTarget(@TenantId() tenantId: string, @Query() query: QueryCommentsDto) {
    return this.commentsService.findByTarget(tenantId, query.targetType, query.targetId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UuidParam() id: string,
    @Body() dto: UpdateCommentDto
  ) {
    return this.commentsService.update(tenantId, id, user.userId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  remove(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UuidParam() id: string
  ) {
    return this.commentsService.remove(tenantId, id, user.userId);
  }
}
