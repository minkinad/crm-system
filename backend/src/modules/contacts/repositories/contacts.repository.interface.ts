import { ContactEntity } from '../contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { QueryContactsDto } from '../dto/query-contacts.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';

// Contacts persistence abstraction for testability and modularity.
export interface ContactsRepository {
  create(tenantId: string, dto: CreateContactDto): Promise<ContactEntity>;
  findAll(tenantId: string, query: QueryContactsDto): Promise<{ data: ContactEntity[]; total: number }>;
  findById(tenantId: string, id: string): Promise<ContactEntity | null>;
  update(tenantId: string, id: string, dto: UpdateContactDto): Promise<ContactEntity | null>;
  softDelete(tenantId: string, id: string): Promise<void>;
}

// DI token.
export const CONTACTS_REPOSITORY = Symbol('CONTACTS_REPOSITORY');
