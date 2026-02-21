import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toCsv } from '../../common/utils/csv.util';
import { RealtimeService } from '../realtime/realtime.service';
import {
  CONTACTS_REPOSITORY,
  ContactsRepository
} from './repositories/contacts.repository.interface';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

// Contacts service contains CRM contact use-cases.
@Injectable()
export class ContactsService {
  constructor(
    @Inject(CONTACTS_REPOSITORY)
    private readonly contactsRepository: ContactsRepository,
    private readonly realtimeService: RealtimeService
  ) {}

  async create(tenantId: string, dto: CreateContactDto) {
    const contact = await this.contactsRepository.create(tenantId, dto);
    this.realtimeService.publish(tenantId, 'contacts.created', { id: contact.id });
    return contact;
  }

  findAll(tenantId: string, query: QueryContactsDto) {
    return this.contactsRepository.findAll(tenantId, query);
  }

  async findById(tenantId: string, id: string) {
    const contact = await this.contactsRepository.findById(tenantId, id);
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async update(tenantId: string, id: string, dto: UpdateContactDto) {
    const updated = await this.contactsRepository.update(tenantId, id, dto);
    if (!updated) {
      throw new NotFoundException('Contact not found');
    }
    this.realtimeService.publish(tenantId, 'contacts.updated', { id: updated.id });
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.contactsRepository.softDelete(tenantId, id);
    this.realtimeService.publish(tenantId, 'contacts.deleted', { id });
  }

  async exportCsv(tenantId: string, query: QueryContactsDto): Promise<string> {
    const { data } = await this.contactsRepository.findAll(tenantId, {
      ...query,
      page: 1,
      limit: 1000
    });

    return toCsv(
      data.map((contact) => ({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        position: contact.position,
        accountId: contact.accountId,
        ownerId: contact.ownerId,
        createdAt: contact.createdAt.toISOString()
      }))
    );
  }
}
