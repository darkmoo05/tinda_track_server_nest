import { Injectable, Logger } from '@nestjs/common';
import type { Party } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';

@Injectable()
export class PartyService {
  private readonly logger = new Logger(PartyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async push(userId: string, records: PartyItemDto[]): Promise<number> {
    await Promise.all(
      records.map((record) =>
        this.prisma.party.upsert({
          where: { syncId: record.syncId },
          create: {
            userId,
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
            userId,
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

  async pull(userId: string, query: PullPartiesQueryDto): Promise<Party[]> {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    return this.prisma.party.findMany({
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
