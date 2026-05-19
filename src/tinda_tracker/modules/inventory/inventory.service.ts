import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Product, StockMovement } from '@prisma/client';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        syncId: dto.syncId,
        deviceId: dto.deviceId,
        name: dto.name,
        sku: dto.sku,
        description: dto.description ?? '',
        category: dto.category ?? 'General',
        unit: dto.unit ?? 'pcs',
        costPrice: dto.costPrice ?? 0,
        sellingPrice: dto.sellingPrice,
        stockQuantity: dto.stockQuantity ?? 0,
        reorderPoint: dto.reorderPoint ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async list(query: ListProductsQueryDto): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        isDeleted: query.includeDeleted ? undefined : false,
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
                { category: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      take: query.limit ?? 50,
    });
  }

  async update(productId: string, dto: UpdateProductDto): Promise<Product> {
    await this.ensureProductExists(productId);

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.costPrice !== undefined ? { costPrice: dto.costPrice } : {}),
        ...(dto.sellingPrice !== undefined ? { sellingPrice: dto.sellingPrice } : {}),
        ...(dto.stockQuantity !== undefined ? { stockQuantity: dto.stockQuantity } : {}),
        ...(dto.reorderPoint !== undefined ? { reorderPoint: dto.reorderPoint } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.deviceId !== undefined ? { deviceId: dto.deviceId } : {}),
      },
    });
  }

  async adjustStock(productId: string, dto: AdjustStockDto): Promise<{ product: Product; movement: StockMovement }> {
    return this.prisma.$transaction(async (client) => {
      const product = await client.product.findUnique({ where: { id: productId } });
      if (!product || product.isDeleted) {
        throw new NotFoundException('Product not found');
      }

      const previousQuantity = product.stockQuantity;
      const newQuantity = previousQuantity + dto.quantityDelta;
      if (newQuantity < 0) {
        throw new NotFoundException('Stock quantity cannot go below zero');
      }

      const updatedProduct = await client.product.update({
        where: { id: productId },
        data: { stockQuantity: newQuantity },
      });

      const movement = await client.stockMovement.create({
        data: {
          productId,
          movementType:
            dto.movementType ??
            (dto.quantityDelta >= 0 ? StockMovementType.RESTOCK : StockMovementType.ADJUSTMENT),
          quantity: dto.quantityDelta,
          previousQuantity,
          newQuantity,
          note: dto.note ?? '',
          reference: dto.reference ?? `INV-${randomUUID().slice(0, 8).toUpperCase()}`,
        },
      });

      return { product: updatedProduct, movement };
    });
  }

  async remove(productId: string): Promise<Product> {
    await this.ensureProductExists(productId);
    return this.prisma.product.update({
      where: { id: productId },
      data: { isDeleted: true, isActive: false },
    });
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.isDeleted) {
      throw new NotFoundException('Product not found');
    }
  }
}
