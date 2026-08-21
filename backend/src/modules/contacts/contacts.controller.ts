import { Body, Controller, Delete, Get, Header, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/constants/roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { UuidParam } from '../../common/decorators/uuid-param.decorator';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

// Contacts CRUD API with export endpoint.
@ApiTags('Contacts')
@Controller({ path: 'contacts', version: '1' })
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@TenantId() tenantId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(tenantId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findAll(@TenantId() tenantId: string, @Query() query: QueryContactsDto) {
    return this.contactsService.findAll(tenantId, query);
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="contacts.csv"')
  @Roles(Role.ADMIN, Role.MANAGER)
  exportCsv(@TenantId() tenantId: string, @Query() query: QueryContactsDto) {
    return this.contactsService.exportCsv(tenantId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.VIEWER)
  findById(@TenantId() tenantId: string, @UuidParam() id: string) {
    return this.contactsService.findById(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(@TenantId() tenantId: string, @UuidParam() id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@TenantId() tenantId: string, @UuidParam() id: string) {
    return this.contactsService.remove(tenantId, id);
  }
}
