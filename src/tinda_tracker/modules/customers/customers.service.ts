import { Injectable, NotFoundException } from '@nestjs/common';
import type { Customer, UtangRecord } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { AddUtangDto, RecordPaymentDto } from './dto/utang.dto.js';

export interface CustomerWithBalance extends Customer {
  balance: number;
  utangRecords: UtangRecord[];
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CustomerWithBalance[]> {
    const customers = await this.prisma.customer.findMany({
      where: { isDeleted: false },
      include: { utangRecords: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } } },
      orderBy: { name: 'asc' },
    });

    return customers
      .map((c) => ({
        ...c,
        balance: c.utangRecords.reduce((sum, r) => sum + r.amount, 0),
      }))
      .sort((a, b) => b.balance - a.balance);
  }

  async findOne(id: string): Promise<CustomerWithBalance> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { utangRecords: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } } },
    });
    if (!customer || customer.isDeleted) {
      throw new NotFoundException('Customer not found');
    }
    return {
      ...customer,
      balance: customer.utangRecords.reduce((sum, r) => sum + r.amount, 0),
    };
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        name: dto.name,
        phone: dto.phone ?? '',
        address: dto.address ?? '',
        notes: dto.notes ?? '',
      },
    });
  }

  async addUtang(customerId: string, dto: AddUtangDto): Promise<UtangRecord> {
    await this.ensureCustomerExists(customerId);
    return this.prisma.utangRecord.create({
      data: {
        customerId,
        description: dto.description,
        amount: Math.abs(dto.amount),
      },
    });
  }

  async recordPayment(customerId: string, dto: RecordPaymentDto): Promise<UtangRecord> {
    await this.ensureCustomerExists(customerId);
    return this.prisma.utangRecord.create({
      data: {
        customerId,
        description: dto.note ?? 'Payment received',
        amount: -Math.abs(dto.amount),
      },
    });
  }

  async remove(id: string): Promise<Customer> {
    await this.ensureCustomerExists(id);
    return this.prisma.customer.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  private async ensureCustomerExists(id: string): Promise<void> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || customer.isDeleted) {
      throw new NotFoundException('Customer not found');
    }
  }
}
