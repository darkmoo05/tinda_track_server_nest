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
    return this.prisma.sale.findMany({
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 20,
    });
  }

  private buildReference(): string {
    return `SALE-${randomUUID().slice(0, 8).toUpperCase()}`;
  }
}
