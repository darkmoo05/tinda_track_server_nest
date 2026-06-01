import { Injectable, NotFoundException } from '@nestjs/common';
import type { Customer, UtangRecord } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { AddUtangDto, RecordPaymentDto } from './dto/utang.dto.js';
import {
  PullCustomersQueryDto,
  PullUtangRecordsQueryDto,
  PushCustomerDto,
  PushUtangRecordDto,
} from './dto/sync.dto.js';

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

  // ─── Customer sync (push/pull) ────────────────────────────────────────────

  async pushCustomers(records: PushCustomerDto[]): Promise<number> {
    let synced = 0;
    for (const r of records) {
      const existing = await this.prisma.customer.findUnique({
        where: { syncId: r.syncId },
      });
      const incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
      if (existing && existing.updatedAt > incomingUpdatedAt) continue;
      const data = {
        deviceId: r.deviceId ?? null,
        name: r.name,
        phone: r.phone ?? '',
        address: r.address ?? '',
        notes: r.notes ?? '',
        isDeleted: r.isDeleted ?? false,
      };
      if (existing) {
        await this.prisma.customer.update({ where: { id: existing.id }, data });
      } else {
        await this.prisma.customer.create({
          data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
        });
      }
      synced++;
    }
    return synced;
  }

  async pullCustomers(query: PullCustomersQueryDto): Promise<Customer[]> {
    const sinceMs = Number(query.since ?? '0');
    const isIncremental = Number.isFinite(sinceMs) && sinceMs > 0;
    return this.prisma.customer.findMany({
      where: isIncremental
        ? {
            updatedAt: { gt: new Date(sinceMs) },
            ...(query.deviceId ? { deviceId: { not: query.deviceId } } : {}),
          }
        : { isDeleted: false },
      orderBy: isIncremental ? { updatedAt: 'asc' } : { createdAt: 'asc' },
    });
  }

  // ─── UtangRecord sync (push/pull) ─────────────────────────────────────────

  async pushUtangRecords(records: PushUtangRecordDto[]): Promise<number> {
    let synced = 0;
    for (const r of records) {
      const existing = await this.prisma.utangRecord.findUnique({
        where: { syncId: r.syncId },
      });
      const incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
      if (existing && existing.updatedAt > incomingUpdatedAt) continue;
      const data = {
        deviceId: r.deviceId ?? null,
        customerId: r.customerId,
        description: r.description ?? '',
        amount: r.amount,
        isDeleted: r.isDeleted ?? false,
      };
      if (existing) {
        await this.prisma.utangRecord.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await this.prisma.utangRecord.create({
          data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
        });
      }
      synced++;
    }
    return synced;
  }

  async pullUtangRecords(query: PullUtangRecordsQueryDto): Promise<UtangRecord[]> {
    const sinceMs = Number(query.since ?? '0');
    const isIncremental = Number.isFinite(sinceMs) && sinceMs > 0;
    return this.prisma.utangRecord.findMany({
      where: isIncremental
        ? {
            updatedAt: { gt: new Date(sinceMs) },
            ...(query.deviceId ? { deviceId: { not: query.deviceId } } : {}),
          }
        : { isDeleted: false },
      orderBy: isIncremental ? { updatedAt: 'asc' } : { createdAt: 'asc' },
    });
  }
}
