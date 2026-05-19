import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [totals, recentEntries] = await Promise.all([
      this.prisma.ledgerEntry.aggregate({
        where: { isDeleted: false },
        _sum: {
          walletDelta: true,
          mayaWalletDelta: true,
          onHandDelta: true,
          recordedFlow: true,
        },
      }),
      this.prisma.ledgerEntry.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      gcashBalance: totals._sum.walletDelta ?? 0,
      mayaBalance: totals._sum.mayaWalletDelta ?? 0,
      onHandBalance: totals._sum.onHandDelta ?? 0,
      totalRecordedFlow: totals._sum.recordedFlow ?? 0,
      recentEntries,
    };
  }
}
