import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ContactEntity } from '../contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { QueryContactsDto } from '../dto/query-contacts.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ContactsRepository } from './contacts.repository.interface';

// TypeORM contacts repository with tenant-aware filtering.
@Injectable()
export class TypeOrmContactsRepository implements ContactsRepository {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly repository: Repository<ContactEntity>
  ) {}

  create(tenantId: string, dto: CreateContactDto): Promise<ContactEntity> {
    return this.repository.save(this.repository.create({ tenantId, ...dto }));
  }

  async findAll(
    tenantId: string,
    query: QueryContactsDto
  ): Promise<{ data: ContactEntity[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('contact')
      .where('contact.tenantId = :tenantId', { tenantId });

    if (query.accountId) {
      qb.andWhere('contact.accountId = :accountId', { accountId: query.accountId });
    }

    if (query.q) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('contact.firstName ILIKE :q', { q: `%${query.q}%` })
            .orWhere('contact.lastName ILIKE :q', { q: `%${query.q}%` })
            .orWhere('contact.email ILIKE :q', { q: `%${query.q}%` })
            .orWhere('contact.phone ILIKE :q', { q: `%${query.q}%` });
        })
      );
    }

    qb.orderBy('contact.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  findById(tenantId: string, id: string): Promise<ContactEntity | null> {
    return this.repository.findOne({ where: { tenantId, id } });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateContactDto
  ): Promise<ContactEntity | null> {
    const contact = await this.findById(tenantId, id);
    if (!contact) {
      return null;
    }

    Object.assign(contact, dto);
    return this.repository.save(contact);
  }

  async softDelete(tenantId: string, id: string): Promise<void> {
    await this.repository.softDelete({ tenantId, id });
  }
}
