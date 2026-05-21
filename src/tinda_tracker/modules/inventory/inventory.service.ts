import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import type { Product, ProductCategory, ShelfLocation, StockMovement } from '@prisma/client';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { IStorageProvider } from '../../../core/storage/storage-provider.interface.js';
import { STORAGE_PROVIDER } from '../../../core/storage/storage-provider.interface.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CategoryRecordDto } from './dto/push-categories.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { ShelfLocationRecordDto } from './dto/push-shelf-locations.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

/** Hard cap on the number of categories pinned to the dashboard chip row. */
const MAX_QUICK_ACCESS_CATEGORIES = 10;

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    // Check for a duplicate SKU before attempting any write. Return 409 so
    // the client can offer the user a "restock existing product" flow.
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existing && !existing.isDeleted) {
      throw new ConflictException({
        code: 'DUPLICATE_SKU',
        message: `A product with SKU "${dto.sku}" already exists.`,
        existingProduct: existing,
      });
    }

    // Resolve optional category / shelf-location relations by syncId.
    let categoryId: string | undefined;
    let resolvedCategory = dto.category ?? 'General';
    if (dto.categorySyncId) {
      const cat = await this.prisma.productCategory.findUnique({ where: { syncId: dto.categorySyncId } });
      if (cat && !cat.isDeleted) { categoryId = cat.id; resolvedCategory = cat.name; }
    }
    let shelfLocationId: string | undefined;
    let resolvedShelfLocation = dto.shelfLocation ?? 'Counter';
    if (dto.shelfLocationSyncId) {
      const loc = await this.prisma.shelfLocation.findUnique({ where: { syncId: dto.shelfLocationSyncId } });
      if (loc && !loc.isDeleted) { shelfLocationId = loc.id; resolvedShelfLocation = loc.name; }
    }

    const fields = {
      deviceId: dto.deviceId,
      name: dto.name,
      sku: dto.sku,
      description: dto.description ?? '',
      category: resolvedCategory,
      unit: dto.unit ?? 'pcs',
      costPrice: dto.costPrice ?? 0,
      sellingPrice: dto.sellingPrice,
      stockQuantity: dto.stockQuantity ?? 0,
      reorderPoint: dto.reorderPoint ?? 0,
      isActive: dto.isActive ?? true,
      shelfLocation: resolvedShelfLocation,
      ...(categoryId ? { categoryId } : {}),
      ...(shelfLocationId ? { shelfLocationId } : {}),
      ...(dto.expirationDate ? { expirationDate: new Date(dto.expirationDate) } : {}),
    };
    // Upsert by syncId so that retries from the same offline device never
    // cause a P2002 unique-constraint error. If the record was already
    // created by a previous attempt, return it unchanged.
    if (dto.syncId) {
      return this.prisma.product.upsert({
        where:  { syncId: dto.syncId },
        create: { syncId: dto.syncId, ...fields },
        update: {},
      });
    }
    return this.prisma.product.create({ data: fields });
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

    // Resolve optional category / shelf-location relations by syncId.
    let categoryId: string | undefined;
    let resolvedCategory: string | undefined = dto.category;
    if (dto.categorySyncId) {
      const cat = await this.prisma.productCategory.findUnique({ where: { syncId: dto.categorySyncId } });
      if (cat && !cat.isDeleted) { categoryId = cat.id; resolvedCategory = cat.name; }
    }
    let shelfLocationId: string | undefined;
    let resolvedShelfLocation: string | undefined = dto.shelfLocation;
    if (dto.shelfLocationSyncId) {
      const loc = await this.prisma.shelfLocation.findUnique({ where: { syncId: dto.shelfLocationSyncId } });
      if (loc && !loc.isDeleted) { shelfLocationId = loc.id; resolvedShelfLocation = loc.name; }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(resolvedCategory !== undefined ? { category: resolvedCategory } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.costPrice !== undefined ? { costPrice: dto.costPrice } : {}),
        ...(dto.sellingPrice !== undefined ? { sellingPrice: dto.sellingPrice } : {}),
        ...(dto.stockQuantity !== undefined ? { stockQuantity: dto.stockQuantity } : {}),
        ...(dto.reorderPoint !== undefined ? { reorderPoint: dto.reorderPoint } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.deviceId !== undefined ? { deviceId: dto.deviceId } : {}),
        ...(resolvedShelfLocation !== undefined ? { shelfLocation: resolvedShelfLocation } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(shelfLocationId ? { shelfLocationId } : {}),
        ...(dto.expirationDate !== undefined
          ? { expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null }
          : {}),
      },
    });
  }

  /**
   * Persist the image URL returned by the storage provider on the product.
   * Called after Multer writes the file to disk inside the controller.
   */
  async updateImage(productId: string, file: Express.Multer.File): Promise<Product> {
    // Fetch the product first so we know the old imageUrl to clean up.
    const existing = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.isDeleted) throw new NotFoundException('Product not found');

    const imageUrl = `/uploads/products/${file.filename}`;
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
    });

    // After the DB update succeeds, delete the previous image file.
    // Fire-and-forget: storage cleanup must never fail the HTTP response.
    if (existing.imageUrl) {
      const oldFilename = existing.imageUrl.split('/').pop();
      if (oldFilename) {
        const oldPath = join(file.destination, oldFilename);
        unlink(oldPath).catch(() => {
          // File may already be gone or path may differ — safe to ignore.
        });
      }
    }

    return updated;
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
        throw new BadRequestException('Stock quantity cannot go below zero');
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
          ...(dto.expirationDate ? { expirationDate: new Date(dto.expirationDate) } : {}),
        },
      });

      return { product: updatedProduct, movement };
    });
  }

  async getMovements(productId: string): Promise<StockMovement[]> {
    await this.ensureProductExists(productId);
    return this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 200,
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

  // ─── Category management ─────────────────────────────────────────────────

  /**
   * Bulk upsert from the Flutter sync service. Each record may flip
   * `isQuickAccess`; the 10-pin cap is enforced *before* anything is written so
   * a single bad payload never partially mutates the table.
   */
  async pushCategories(records: CategoryRecordDto[]): Promise<ProductCategory[]> {
    await this.assertQuickAccessCapAfterPush(records);
    const results: ProductCategory[] = [];
    for (const r of records) {
      const data = {
        name: r.name,
        description: r.description ?? '',
        examples: r.examples ?? '',
        isQuickAccess: r.isQuickAccess ?? false,
        isDeleted: r.isDeleted ?? false,
      };
      // Try by syncId first (normal case). If absent, fall back to name —
      // this happens when the server was seeded with a different syncId
      // than the device, or when two devices created the same category
      // offline. Adopting the existing row's id keeps FK chains intact.
      let item = await this.prisma.productCategory.findUnique({
        where: { syncId: r.syncId },
      });
      item ??= await this.prisma.productCategory.findUnique({
        where: { name: r.name },
      });
      if (item) {
        item = await this.prisma.productCategory.update({
          where: { id: item.id },
          // Claim the row for the incoming syncId so future pushes hit the
          // fast path. Safe because syncId is also @unique.
          data: { ...data, syncId: r.syncId },
        });
      } else {
        item = await this.prisma.productCategory.create({
          data: { syncId: r.syncId, ...data },
        });
      }
      results.push(item);
    }
    return results;
  }

  async pullCategories(sinceMs: number): Promise<ProductCategory[]> {
    const since = new Date(sinceMs);
    return this.prisma.productCategory.findMany({
      where: { updatedAt: { gte: since } },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async listCategories(): Promise<ProductCategory[]> {
    return this.prisma.productCategory.findMany({
      where: { isDeleted: false },
      orderBy: [{ isQuickAccess: 'desc' }, { name: 'asc' }],
    });
  }

  async deleteCategory(id: string): Promise<ProductCategory> {
    const existing = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');
    return this.prisma.productCategory.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Reject the entire push when, after merging in the incoming `isQuickAccess`
   * flags, the count of pinned, active categories would exceed
   * [MAX_QUICK_ACCESS_CATEGORIES]. Returning HTTP 400 lets the Flutter UI
   * surface a clear "limit reached" message without leaving the table in a
   * half-applied state.
   */
  private async assertQuickAccessCapAfterPush(records: CategoryRecordDto[]): Promise<void> {
    const incomingSyncIds = records.map((r) => r.syncId);
    const incomingPinnedSyncIds = new Set(
      records
        .filter((r) => r.isQuickAccess === true && r.isDeleted !== true)
        .map((r) => r.syncId),
    );
    // Anything the payload already references is overridden by its new flag,
    // so we only need to count the remaining unaffected rows on disk.
    const otherPinned = await this.prisma.productCategory.count({
      where: {
        isQuickAccess: true,
        isDeleted: false,
        syncId: { notIn: incomingSyncIds },
      },
    });
    const total = otherPinned + incomingPinnedSyncIds.size;
    if (total > MAX_QUICK_ACCESS_CATEGORIES) {
      throw new BadRequestException({
        code: 'QUICK_ACCESS_LIMIT_EXCEEDED',
        message: `Only ${MAX_QUICK_ACCESS_CATEGORIES} categories can be pinned for quick access. Attempted total: ${total}.`,
        limit: MAX_QUICK_ACCESS_CATEGORIES,
        attempted: total,
      });
    }
  }

  // ─── Shelf-location management ────────────────────────────────────────────

  async pushShelfLocations(records: ShelfLocationRecordDto[]): Promise<ShelfLocation[]> {
    const results: ShelfLocation[] = [];
    for (const r of records) {
      const data = {
        name: r.name,
        description: r.description ?? '',
        examples: r.examples ?? '',
        isDeleted: r.isDeleted ?? false,
      };
      // Reconcile by syncId, then by name — same dual-lookup pattern as
      // pushCategories. See that method for the full rationale.
      let item = await this.prisma.shelfLocation.findUnique({
        where: { syncId: r.syncId },
      });
      item ??= await this.prisma.shelfLocation.findUnique({
        where: { name: r.name },
      });
      if (item) {
        item = await this.prisma.shelfLocation.update({
          where: { id: item.id },
          data: { ...data, syncId: r.syncId },
        });
      } else {
        item = await this.prisma.shelfLocation.create({
          data: { syncId: r.syncId, ...data },
        });
      }
      results.push(item);
    }
    return results;
  }

  async pullShelfLocations(sinceMs: number): Promise<ShelfLocation[]> {
    const since = new Date(sinceMs);
    return this.prisma.shelfLocation.findMany({
      where: { updatedAt: { gte: since } },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async listShelfLocations(): Promise<ShelfLocation[]> {
    return this.prisma.shelfLocation.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });
  }

  async deleteShelfLocation(id: string): Promise<ShelfLocation> {
    const existing = await this.prisma.shelfLocation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Shelf location not found');
    return this.prisma.shelfLocation.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Persist the uploaded image URL on the shelf location row, then delete
   * the previous file (if any) so orphaned uploads never accumulate on disk.
   * Routed via [STORAGE_PROVIDER] so swapping in a CDN (DO Spaces, S3) only
   * touches the provider class.
   */
  async updateShelfLocationImage(id: string, file: Express.Multer.File): Promise<ShelfLocation> {
    const existing = await this.prisma.shelfLocation.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) throw new NotFoundException('Shelf location not found');

    const imageUrl = await this.storage.uploadFile(file, 'uploads/shelf-locations');
    const updated = await this.prisma.shelfLocation.update({
      where: { id },
      data: { imageUrl },
    });

    if (existing.imageUrl) {
      const oldFilename = existing.imageUrl.split('/').pop();
      if (oldFilename) {
        const oldPath = join(file.destination, oldFilename);
        // Fire-and-forget — never fail the HTTP response over disk cleanup.
        unlink(oldPath).catch(() => {});
      }
    }
    return updated;
  }
}

