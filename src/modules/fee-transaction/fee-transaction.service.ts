import { Injectable, Logger } from '@nestjs/common';
import type { FeeTransaction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { FeeTransactionItemDto } from './dto/fee-transaction-item.dto.js';
import { PullFeeTransactionsQueryDto } from './dto/pull-fee-transactions-query.dto.js';

@Injectable()
export class FeeTransactionService {
  private readonly logger = new Logger(FeeTransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bulk-upsert fee transactions from a device.
   * Each record is matched by syncId (idempotent).
   */
  async push(records: FeeTransactionItemDto[]): Promise<number> {
    await Promise.all(
      records.map((r) =>
        this.prisma.feeTransaction.upsert({
          where: { syncId: r.syncId },
          create: {
            syncId: r.syncId,
            deviceId: r.deviceId,
            relatedTransactionSyncId: r.relatedTransactionSyncId ?? null,
            feeAmount: r.feeAmount,
            feeType: r.feeType,
            chargeDestination: r.chargeDestination,
            isDeleted: r.isDeleted ?? false,
          },
          update: {
            deviceId: r.deviceId,
            relatedTransactionSyncId: r.relatedTransactionSyncId ?? null,
            feeAmount: r.feeAmount,
            feeType: r.feeType,
            chargeDestination: r.chargeDestination,
            isDeleted: r.isDeleted ?? false,
          },
        }),
      ),
    );

    this.logger.log(`Pushed ${records.length} fee transaction(s)`);
    return records.length;
  }

  /**
   * Return fee transactions updated after `since` that did not originate from
   * `deviceId`. Supports incremental sync from offline clients.
   */
  async pull(query: PullFeeTransactionsQueryDto): Promise<FeeTransaction[]> {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    return this.prisma.feeTransaction.findMany({
      where: isIncrementalSync
        ? {
            updatedAt: { gt: new Date(sinceMs) },
            ...(deviceId ? { deviceId: { not: deviceId } } : {}),
          }
        : { isDeleted: false },
      orderBy: isIncrementalSync ? { updatedAt: 'asc' } : { createdAt: 'asc' },
    });
  }
}
