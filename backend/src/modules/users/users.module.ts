import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Users module wires repository implementation and service layer.
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    UsersService,
    TypeOrmUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: TypeOrmUsersRepository
    }
  ],
  exports: [UsersService, USERS_REPOSITORY, TypeOrmUsersRepository, TypeOrmModule]
})
export class UsersModule {}
