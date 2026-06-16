import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { MonitoringSessionItemDto } from './dto/monitoring-session-item.dto.js';
import { PullMonitoringSessionsQueryDto } from './dto/pull-monitoring-sessions-query.dto.js';

@Injectable()
export class MonitoringSessionService {
  private readonly logger = new Logger(MonitoringSessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async push(userId: string, records: MonitoringSessionItemDto[]): Promise<number> {
    await Promise.all(
      records.map((record) =>
        this.prisma.monitoringSession.upsert({
          where: { syncId: record.syncId },
          create: {
            userId,
            syncId: record.syncId,
            deviceId: record.deviceId,
            name: record.name,
            status: record.status ?? 'ACTIVE',
            startDateMs: BigInt(record.startDateMs),
            endDateMs: record.endDateMs ? BigInt(record.endDateMs) : null,
            startGcash: record.startGcash ?? 0.0,
            startMaya: record.startMaya ?? 0.0,
            startOnHand: record.startOnHand ?? 0.0,
            endGcash: record.endGcash ?? null,
            endMaya: record.endMaya ?? null,
            endOnHand: record.endOnHand ?? null,
            isDeleted: record.isDeleted ?? false,
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
          },
          update: {
            userId,
            deviceId: record.deviceId,
            name: record.name,
            status: record.status ?? 'ACTIVE',
            startDateMs: BigInt(record.startDateMs),
            endDateMs: record.endDateMs ? BigInt(record.endDateMs) : null,
            startGcash: record.startGcash ?? 0.0,
            startMaya: record.startMaya ?? 0.0,
            startOnHand: record.startOnHand ?? 0.0,
            endGcash: record.endGcash ?? null,
            endMaya: record.endMaya ?? null,
            endOnHand: record.endOnHand ?? null,
            isDeleted: record.isDeleted ?? false,
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
          },
        }),
      ),
    );

    this.logger.log(`Pushed ${records.length} monitoring session record(s)`);
    return records.length;
  }

  async pull(userId: string, query: PullMonitoringSessionsQueryDto) {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    const sessions = await this.prisma.monitoringSession.findMany({
      where: isIncrementalSync
        ? {
            userId,
            updatedAt: { gt: new Date(sinceMs) },
            ...(deviceId ? { deviceId: { not: deviceId } } : {}),
          }
        : { userId, isDeleted: false },
      orderBy: isIncrementalSync ? { updatedAt: 'asc' } : { createdAt: 'asc' },
    });

    // Map BigInt to standard number to prevent JSON.stringify errors
    return sessions.map((s) => ({
      id: s.id,
      syncId: s.syncId,
      deviceId: s.deviceId,
      name: s.name,
      status: s.status,
      startDateMs: Number(s.startDateMs),
      endDateMs: s.endDateMs ? Number(s.endDateMs) : null,
      startGcash: s.startGcash,
      startMaya: s.startMaya,
      startOnHand: s.startOnHand,
      endGcash: s.endGcash,
      endMaya: s.endMaya,
      endOnHand: s.endOnHand,
      isDeleted: s.isDeleted,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }
}
