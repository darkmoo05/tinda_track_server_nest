import { Injectable, Logger } from '@nestjs/common';
import type { Party } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';

@Injectable()
export class PartyService {
  private readonly logger = new Logger(PartyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async push(records: PartyItemDto[]): Promise<number> {
    await Promise.all(
      records.map((record) =>
        this.prisma.party.upsert({
          where: { syncId: record.syncId },
          create: {
            syncId: record.syncId,
            deviceId: record.deviceId,
            name: record.name,
            accountNumber: record.accountNumber,
            entityId: record.entityId ?? '',
            description: record.description ?? '',
            joinDate: record.joinDate,
            isVerified: record.isVerified ?? false,
            isDeleted: record.isDeleted ?? false,
          },
          update: {
            deviceId: record.deviceId,
            name: record.name,
            accountNumber: record.accountNumber,
            entityId: record.entityId ?? '',
            description: record.description ?? '',
            joinDate: record.joinDate,
            isVerified: record.isVerified ?? false,
            isDeleted: record.isDeleted ?? false,
          },
        }),
      ),
    );

    this.logger.log(`Pushed ${records.length} party record(s)`);
    return records.length;
  }

  async pull(query: PullPartiesQueryDto): Promise<Party[]> {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    return this.prisma.party.findMany({
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
