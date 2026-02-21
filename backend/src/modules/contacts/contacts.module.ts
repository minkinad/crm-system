import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './contact.entity';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CONTACTS_REPOSITORY } from './repositories/contacts.repository.interface';
import { TypeOrmContactsRepository } from './repositories/typeorm-contacts.repository';

// Contacts module encapsulates lead/customer person records.
@Module({
  imports: [TypeOrmModule.forFeature([ContactEntity])],
  controllers: [ContactsController],
  providers: [
    ContactsService,
    TypeOrmContactsRepository,
    {
      provide: CONTACTS_REPOSITORY,
      useExisting: TypeOrmContactsRepository
    }
  ],
  exports: [ContactsService]
})
export class ContactsModule {}
