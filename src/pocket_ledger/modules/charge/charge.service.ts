import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ChargeItemDto } from './dto/push-charges.dto.js';
import { PullChargesQueryDto } from './dto/pull-charges-query.dto.js';
// The Charge type lives in the generated models barrel
import type { Charge } from '@prisma/client';

@Injectable()
export class ChargeService {
  private readonly logger = new Logger(ChargeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bulk-upsert charges from a device.
   *
   * Uses Prisma's `upsertMany` pattern — each record is matched by syncId.
   * If a record with that syncId already exists it is fully overwritten,
   * otherwise a new row is inserted. This mirrors the Express bulkWrite upsert.
   *
   * @returns number of records processed
   */
  async push(records: ChargeItemDto[]): Promise<number> {
    // Each upsert is keyed on syncId so it is inherently idempotent.
    // We run them in parallel; if you need strict all-or-nothing atomicity
    // across every record, wrap in prisma.$transaction(() => Promise.all(...)).
    await Promise.all(
      records.map((r) =>
        this.prisma.charge.upsert({
          where: { syncId: r.syncId },
          create: {
            syncId: r.syncId,
            deviceId: r.deviceId,
            lowerBound: r.lowerBound,
            upperBound: r.upperBound,
            chargeAmount: r.chargeAmount,
            transactionTypeKey: r.transactionTypeKey ?? 'gcash_cashin',
            isDeleted: r.isDeleted ?? false,
          },
          update: {
            deviceId: r.deviceId,
            lowerBound: r.lowerBound,
            upperBound: r.upperBound,
            chargeAmount: r.chargeAmount,
            transactionTypeKey: r.transactionTypeKey ?? 'gcash_cashin',
            isDeleted: r.isDeleted ?? false,
          },
        }),
      ),
    );

    this.logger.log(`Pushed ${records.length} charge(s)`);
    return records.length;
  }

  /**
   * Return all charges updated after `since` that did not originate from
   * `deviceId`. Supports incremental sync from offline clients.
   *
   * @param query.since    - Unix ms timestamp (optional)
   * @param query.deviceId - Exclude this device's own records (optional)
   */
  async pull(query: PullChargesQueryDto): Promise<Charge[]> {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    return this.prisma.charge.findMany({
      where: isIncrementalSync
        ? {
            updatedAt: { gt: new Date(sinceMs) },
            ...(deviceId ? { deviceId: { not: deviceId } } : {}),
          }
        : { isDeleted: false },
      orderBy: isIncrementalSync ? { updatedAt: 'asc' } : { createdAt: 'asc' },
    });
  }

  async findApplicableCharge(amount: number, transactionTypeKey?: string): Promise<Charge | null> {
    return this.prisma.charge.findFirst({
      where: {
        isDeleted: false,
        lowerBound: { lte: amount },
        upperBound: { gte: amount },
        ...(transactionTypeKey ? { transactionTypeKey } : {}),
      },
      orderBy: [{ lowerBound: 'asc' }, { createdAt: 'asc' }],
    });
  }
}
