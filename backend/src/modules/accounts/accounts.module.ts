import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './account.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { ACCOUNTS_REPOSITORY } from './repositories/accounts.repository.interface';
import { TypeOrmAccountsRepository } from './repositories/typeorm-accounts.repository';

// Accounts module encapsulates company data CRUD and search.
@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity])],
  controllers: [AccountsController],
  providers: [
    AccountsService,
    TypeOrmAccountsRepository,
    {
      provide: ACCOUNTS_REPOSITORY,
      useExisting: TypeOrmAccountsRepository
    }
  ],
  exports: [AccountsService, TypeOrmModule]
})
export class AccountsModule {}
