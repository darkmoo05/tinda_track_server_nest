import { Injectable, Logger } from '@nestjs/common';
import type { LedgerEntry } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { LedgerEntryItemDto } from './dto/ledger-entry-item.dto.js';
import { PullLedgerEntriesQueryDto } from './dto/pull-ledger-entries-query.dto.js';

@Injectable()
export class LedgerEntryService {
  private readonly logger = new Logger(LedgerEntryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async push(records: LedgerEntryItemDto[]): Promise<number> {
    await Promise.all(
      records.map((record) =>
        this.prisma.ledgerEntry.upsert({
          where: { syncId: record.syncId },
          create: {
            syncId: record.syncId,
            deviceId: record.deviceId,
            entryType: record.entryType,
            title: record.title ?? '',
            note: record.note ?? '',
            reference: record.reference ?? '',
            amount: record.amount,
            walletDelta: record.walletDelta ?? 0,
            mayaWalletDelta: record.mayaWalletDelta ?? 0,
            onHandDelta: record.onHandDelta ?? 0,
            recordedFlow: record.recordedFlow ?? 0,
            tag: record.tag ?? '',
            iconKey: record.iconKey ?? '',
            walletAccount: record.walletAccount ?? '',
            ownerScope: record.ownerScope ?? 'Business',
            ownerMovementType: record.ownerMovementType ?? null,
            ownerCategory: record.ownerCategory ?? null,
            ownerPartyName: record.ownerPartyName ?? null,
            ownerPartyAccount: record.ownerPartyAccount ?? null,
            entryDate: record.entryDate,
            isDeleted: record.isDeleted ?? false,
          },
          update: {
            deviceId: record.deviceId,
            entryType: record.entryType,
            title: record.title ?? '',
            note: record.note ?? '',
            reference: record.reference ?? '',
            amount: record.amount,
            walletDelta: record.walletDelta ?? 0,
            mayaWalletDelta: record.mayaWalletDelta ?? 0,
            onHandDelta: record.onHandDelta ?? 0,
            recordedFlow: record.recordedFlow ?? 0,
            tag: record.tag ?? '',
            iconKey: record.iconKey ?? '',
            walletAccount: record.walletAccount ?? '',
            ownerScope: record.ownerScope ?? 'Business',
            ownerMovementType: record.ownerMovementType ?? null,
            ownerCategory: record.ownerCategory ?? null,
            ownerPartyName: record.ownerPartyName ?? null,
            ownerPartyAccount: record.ownerPartyAccount ?? null,
            entryDate: record.entryDate,
            isDeleted: record.isDeleted ?? false,
          },
        }),
      ),
    );

    this.logger.log(`Pushed ${records.length} ledger entry record(s)`);
    return records.length;
  }

  async pull(query: PullLedgerEntriesQueryDto): Promise<LedgerEntry[]> {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    return this.prisma.ledgerEntry.findMany({
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
