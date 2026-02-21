import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEntity } from './tenant.entity';

// Service layer for tenant lifecycle management.
@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>
  ) {}

  async create(dto: CreateTenantDto): Promise<TenantEntity> {
    const tenant = this.tenantRepository.create(dto);
    return this.tenantRepository.save(tenant);
  }

  async findById(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOne({ where: { slug } });
  }

  async findAll(): Promise<TenantEntity[]> {
    return this.tenantRepository.find();
  }

  async update(id: string, dto: UpdateTenantDto): Promise<TenantEntity> {
    const tenant = await this.findById(id);
    Object.assign(tenant, dto);
    return this.tenantRepository.save(tenant);
  }

  async softDelete(id: string): Promise<void> {
    await this.tenantRepository.softDelete(id);
  }
}
