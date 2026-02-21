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
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

// Contacts CRUD API with export endpoint.
@ApiTags('Contacts')
@Controller({ path: 'contacts', version: '1' })
@UseGuards(JwtAuthGuard, TenantAccessGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@Req() req: Request & { tenantId: string }, @Body() dto: CreateContactDto) {
    return this.contactsService.create(req.tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findAll(@Req() req: Request & { tenantId: string }, @Query() query: QueryContactsDto) {
    return this.contactsService.findAll(req.tenantId, query);
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="contacts.csv"')
  @Roles(Role.ADMIN, Role.MANAGER)
  exportCsv(@Req() req: Request & { tenantId: string }, @Query() query: QueryContactsDto) {
    return this.contactsService.exportCsv(req.tenantId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findById(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.contactsService.findById(req.tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateContactDto
  ) {
    return this.contactsService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Req() req: Request & { tenantId: string }, @Param('id') id: string) {
    return this.contactsService.remove(req.tenantId, id);
  }
}
