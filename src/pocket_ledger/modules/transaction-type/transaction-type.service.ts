import { Injectable, Logger } from '@nestjs/common';
import type { TransactionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TransactionTypeItemDto } from './dto/transaction-type-item.dto.js';
import { PullTransactionTypesQueryDto } from './dto/pull-transaction-types-query.dto.js';

@Injectable()
export class TransactionTypeService {
  private readonly logger = new Logger(TransactionTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async push(userId: string, records: TransactionTypeItemDto[]): Promise<number> {
    await Promise.all(
      records.map((record) =>
        this.prisma.transactionType.upsert({
          where: { syncId: record.syncId },
          create: {
            userId,
            syncId: record.syncId,
            deviceId: record.deviceId,
            name: record.name,
            isOutflow: record.isOutflow ?? false,
            walletAccount: record.walletAccount ?? 'GCash',
            isDeleted: record.isDeleted ?? false,
          },
          update: {
            userId,
            deviceId: record.deviceId,
            name: record.name,
            isOutflow: record.isOutflow ?? false,
            walletAccount: record.walletAccount ?? 'GCash',
            isDeleted: record.isDeleted ?? false,
          },
        }),
      ),
    );

    this.logger.log(`Pushed ${records.length} transaction type record(s)`);
    return records.length;
  }

  async pull(userId: string, query: PullTransactionTypesQueryDto): Promise<TransactionType[]> {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    return this.prisma.transactionType.findMany({
      where: isIncrementalSync
        ? {
            userId,
            updatedAt: { gt: new Date(sinceMs) },
            ...(deviceId ? { deviceId: { not: deviceId } } : {}),
          }
        : { userId, isDeleted: false },
      orderBy: isIncrementalSync ? { updatedAt: 'asc' } : { createdAt: 'asc' },
    });
  }
}
