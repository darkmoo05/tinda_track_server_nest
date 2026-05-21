import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Product, Sale } from '@prisma/client';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CheckoutPosDto } from './dto/checkout-pos.dto.js';
import { ListSalesQueryDto } from './dto/list-sales-query.dto.js';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(dto: CheckoutPosDto): Promise<Sale> {
    if (dto.paidAmount < 0) {
      throw new BadRequestException('Paid amount must be zero or greater');
    }

    return this.prisma.$transaction(async (client) => {
      const uniqueProductIds = [...new Set(dto.items.map((item) => item.productId))];
      const products: Product[] = await client.product.findMany({
        where: { id: { in: uniqueProductIds }, isDeleted: false, isActive: true },
      });

      if (products.length !== uniqueProductIds.length) {
        throw new NotFoundException('One or more products were not found');
      }

      const productById = new Map<string, Product>(
        products.map((product) => [product.id, product]),
      );
      const lineItems = dto.items.map((item) => {
        const product = productById.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new BadRequestException('Each checkout item must have a positive whole-number quantity');
        }
        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }
        const lineTotal = product.sellingPrice * item.quantity;
        return { item, product, lineTotal };
      });

      const subtotal = lineItems.reduce((sum, entry) => sum + entry.lineTotal, 0);
      if (dto.paidAmount < subtotal) {
        throw new BadRequestException('Paid amount is less than sale total');
      }

      const changeAmount = dto.paidAmount - subtotal;
      const totalItems = lineItems.reduce((sum, entry) => sum + entry.item.quantity, 0);
      const reference = dto.reference?.trim() || this.buildReference();

      const sale = await client.sale.create({
        data: {
          reference,
          deviceId: dto.deviceId,
          note: dto.note ?? '',
          subtotal,
          totalAmount: subtotal,
          paidAmount: dto.paidAmount,
          changeAmount,
          totalItems,
        },
      });

      for (const entry of lineItems) {
        const previousQuantity = entry.product.stockQuantity;
        const newQuantity = previousQuantity - entry.item.quantity;

        await client.saleItem.create({
          data: {
            saleId: sale.id,
            productId: entry.product.id,
            quantity: entry.item.quantity,
            unitPrice: entry.product.sellingPrice,
            lineTotal: entry.lineTotal,
          },
        });

        await client.product.update({
          where: { id: entry.product.id },
          data: { stockQuantity: newQuantity },
        });

        await client.stockMovement.create({
          data: {
            productId: entry.product.id,
            movementType: StockMovementType.SALE,
            quantity: -entry.item.quantity,
            previousQuantity,
            newQuantity,
            note: dto.note ?? '',
            reference,
          },
        });
      }

      await client.ledgerEntry.create({
        data: {
          syncId: `${sale.id}-sale-${randomUUID()}`,
          deviceId: dto.deviceId ?? 'server',
          entryType: 'POS_SALE',
          title: 'POS Sale',
          note: dto.note ?? '',
          reference,
          amount: subtotal,
          walletDelta: 0,
          mayaWalletDelta: 0,
          onHandDelta: subtotal,
          recordedFlow: subtotal,
          tag: 'pos',
          iconKey: 'pos_sale',
          walletAccount: 'Cash',
          ownerScope: 'Business',
          entryDate: new Date().toISOString(),
          isDeleted: false,
        },
      });

      return sale;
    });
  }

  async listSales(query: ListSalesQueryDto) {
    const fromDate = query.from ? new Date(query.from) : undefined;
    const toDate = query.to ? new Date(query.to) : undefined;

    return this.prisma.sale.findMany({
      where: {
        ...(fromDate || toDate
          ? {
              createdAt: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              },
            }
          : {}),
      },
      include: {
        saleItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 20,
    });
  }

  async getDashboardStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [todaySales, lowStockProducts, weekSales, totalUtang] = await Promise.all([
      this.prisma.sale.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: { saleItems: { include: { product: true } } },
      }),
      this.prisma.product.findMany({
        where: { isDeleted: false, isActive: true },
        select: { id: true, name: true, stockQuantity: true, reorderPoint: true, sellingPrice: true },
      }),
      this.prisma.sale.findMany({
        where: { createdAt: { gte: weekStart } },
        include: { saleItems: { include: { product: true } } },
      }),
      this.prisma.utangRecord.aggregate({
        where: { isDeleted: false },
        _sum: { amount: true },
      }),
    ]);

    const todayTotalSales = todaySales.reduce((s, sale) => s + sale.totalAmount, 0);
    const todayProfit = todaySales.reduce((s, sale) => {
      const profit = sale.saleItems.reduce((sp, item) => {
        const cost = item.product.costPrice ?? 0;
        return sp + (item.unitPrice - cost) * item.quantity;
      }, 0);
      return s + profit;
    }, 0);

    const lowStock = lowStockProducts.filter((p) => p.stockQuantity <= p.reorderPoint);

    // Top 5 selling items this week
    const productSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const sale of weekSales) {
      for (const item of sale.saleItems) {
        const existing = productSalesMap.get(item.productId) ?? {
          name: item.product.name,
          qty: 0,
          revenue: 0,
        };
        existing.qty += item.quantity;
        existing.revenue += item.lineTotal;
        productSalesMap.set(item.productId, existing);
      }
    }
    const topProducts = [...productSalesMap.entries()]
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([productId, stats]) => ({ productId, ...stats }));

    return {
      today: {
        totalSales: todayTotalSales,
        profit: todayProfit,
        transactions: todaySales.length,
      },
      lowStockProducts: lowStock,
      totalOutstandingUtang: totalUtang._sum.amount ?? 0,
      topProductsThisWeek: topProducts,
    };
  }

  async getReports(query: ListSalesQueryDto) {
    const fromDate = query.from ? new Date(query.from) : (() => { const d = new Date(); d.setDate(d.getDate() - 29); d.setHours(0,0,0,0); return d; })();
    const toDate = query.to ? new Date(query.to) : new Date();

    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      include: { saleItems: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const totalSales = sales.reduce((s, sale) => s + sale.totalAmount, 0);
    const totalProfit = sales.reduce((s, sale) => {
      return s + sale.saleItems.reduce((sp, item) => {
        return sp + (item.unitPrice - (item.product.costPrice ?? 0)) * item.quantity;
      }, 0);
    }, 0);

    // Daily breakdown for chart
    const dailyMap = new Map<string, { date: string; sales: number; profit: number; transactions: number }>();
    for (const sale of sales) {
      const dateKey = sale.createdAt.toISOString().slice(0, 10);
      const existing = dailyMap.get(dateKey) ?? { date: dateKey, sales: 0, profit: 0, transactions: 0 };
      existing.sales += sale.totalAmount;
      existing.profit += sale.saleItems.reduce((sp, item) => {
        return sp + (item.unitPrice - (item.product.costPrice ?? 0)) * item.quantity;
      }, 0);
      existing.transactions++;
      dailyMap.set(dateKey, existing);
    }

    // Top products
    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const sale of sales) {
      for (const item of sale.saleItems) {
        const existing = productMap.get(item.productId) ?? { name: item.product.name, qty: 0, revenue: 0 };
        existing.qty += item.quantity;
        existing.revenue += item.lineTotal;
        productMap.set(item.productId, existing);
      }
    }
    const topProducts = [...productMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([productId, stats]) => ({ productId, ...stats }));

    return {
      summary: { totalSales, totalProfit, totalTransactions: sales.length },
      daily: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
      topProducts,
    };
  }

  private buildReference(): string {
    return `SALE-${randomUUID().slice(0, 8).toUpperCase()}`;
  }
}
