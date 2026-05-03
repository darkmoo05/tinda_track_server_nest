import { Injectable, Logger } from '@nestjs/common';
import type { MovementCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MovementCategoryItemDto } from './dto/movement-category-item.dto.js';
import { PullMovementCategoriesQueryDto } from './dto/pull-movement-categories-query.dto.js';

@Injectable()
export class MovementCategoryService {
  private readonly logger = new Logger(MovementCategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async push(records: MovementCategoryItemDto[]): Promise<number> {
    await Promise.all(
      records.map((record) =>
        this.prisma.movementCategory.upsert({
          where: { syncId: record.syncId },
          create: {
            syncId: record.syncId,
            deviceId: record.deviceId,
            name: record.name,
            isDeleted: record.isDeleted ?? false,
          },
          update: {
            deviceId: record.deviceId,
            name: record.name,
            isDeleted: record.isDeleted ?? false,
          },
        }),
      ),
    );

    this.logger.log(`Pushed ${records.length} movement category record(s)`);
    return records.length;
  }

  async pull(query: PullMovementCategoriesQueryDto): Promise<MovementCategory[]> {
    const { since, deviceId } = query;
    const sinceMs = Number(since ?? '0');
    const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;

    return this.prisma.movementCategory.findMany({
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
