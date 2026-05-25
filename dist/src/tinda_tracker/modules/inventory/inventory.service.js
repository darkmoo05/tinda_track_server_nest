"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
const storage_provider_interface_js_1 = require("../../../core/storage/storage-provider.interface.js");
const MAX_QUICK_ACCESS_CATEGORIES = 10;
let InventoryService = class InventoryService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async create(dto) {
        const existing = await this.prisma.product.findUnique({
            where: { sku: dto.sku },
        });
        if (existing && !existing.isDeleted) {
            throw new common_1.ConflictException({
                code: 'DUPLICATE_SKU',
                message: `A product with SKU "${dto.sku}" already exists.`,
                existingProduct: existing,
            });
        }
        let categoryId;
        let resolvedCategory = dto.category ?? 'General';
        if (dto.categorySyncId) {
            const cat = await this.prisma.productCategory.findUnique({ where: { syncId: dto.categorySyncId } });
            if (cat && !cat.isDeleted) {
                categoryId = cat.id;
                resolvedCategory = cat.name;
            }
        }
        let shelfLocationId;
        let resolvedShelfLocation = dto.shelfLocation ?? 'Counter';
        if (dto.shelfLocationSyncId) {
            const loc = await this.prisma.shelfLocation.findUnique({ where: { syncId: dto.shelfLocationSyncId } });
            if (loc && !loc.isDeleted) {
                shelfLocationId = loc.id;
                resolvedShelfLocation = loc.name;
            }
        }
        const fields = {
            deviceId: dto.deviceId,
            name: dto.name,
            sku: dto.sku,
            description: dto.description ?? '',
            category: resolvedCategory,
            baseUnit: dto.baseUnit ?? 'pcs',
            costPrice: dto.costPrice ?? 0,
            sellingPrice: dto.sellingPrice,
            stockInBaseUnit: dto.stockInBaseUnit ?? 0,
            reorderPoint: dto.reorderPoint ?? 0,
            isActive: dto.isActive ?? true,
            shelfLocation: resolvedShelfLocation,
            ...(categoryId ? { categoryId } : {}),
            ...(shelfLocationId ? { shelfLocationId } : {}),
            ...(dto.expirationDate ? { expirationDate: new Date(dto.expirationDate) } : {}),
            ...(dto.unitConversions && dto.unitConversions.length > 0
                ? {
                    unitConversions: {
                        create: dto.unitConversions.map((c) => ({
                            syncId: c.syncId ?? (0, node_crypto_1.randomUUID)(),
                            unitName: c.unitName,
                            conversionFactor: c.conversionFactor,
                            costPrice: c.costPrice,
                            sellingPrice: c.sellingPrice,
                        })),
                    },
                }
                : {}),
        };
        if (dto.syncId) {
            return this.prisma.product.upsert({
                where: { syncId: dto.syncId },
                create: { syncId: dto.syncId, ...fields },
                update: {},
                include: { unitConversions: true },
            });
        }
        return this.prisma.product.create({
            data: fields,
            include: { unitConversions: true },
        });
    }
    async list(query) {
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
            include: { unitConversions: true },
        });
    }
    async update(productId, dto) {
        await this.ensureProductExists(productId);
        let categoryId;
        let resolvedCategory = dto.category;
        if (dto.categorySyncId) {
            const cat = await this.prisma.productCategory.findUnique({ where: { syncId: dto.categorySyncId } });
            if (cat && !cat.isDeleted) {
                categoryId = cat.id;
                resolvedCategory = cat.name;
            }
        }
        let shelfLocationId;
        let resolvedShelfLocation = dto.shelfLocation;
        if (dto.shelfLocationSyncId) {
            const loc = await this.prisma.shelfLocation.findUnique({ where: { syncId: dto.shelfLocationSyncId } });
            if (loc && !loc.isDeleted) {
                shelfLocationId = loc.id;
                resolvedShelfLocation = loc.name;
            }
        }
        return this.prisma.product.update({
            where: { id: productId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(resolvedCategory !== undefined ? { category: resolvedCategory } : {}),
                ...(dto.baseUnit !== undefined ? { baseUnit: dto.baseUnit } : {}),
                ...(dto.costPrice !== undefined ? { costPrice: dto.costPrice } : {}),
                ...(dto.sellingPrice !== undefined ? { sellingPrice: dto.sellingPrice } : {}),
                ...(dto.stockInBaseUnit !== undefined
                    ? { stockInBaseUnit: dto.stockInBaseUnit }
                    : {}),
                ...(dto.reorderPoint !== undefined ? { reorderPoint: dto.reorderPoint } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
                ...(dto.deviceId !== undefined ? { deviceId: dto.deviceId } : {}),
                ...(resolvedShelfLocation !== undefined ? { shelfLocation: resolvedShelfLocation } : {}),
                ...(categoryId ? { categoryId } : {}),
                ...(shelfLocationId ? { shelfLocationId } : {}),
                ...(dto.expirationDate !== undefined
                    ? { expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null }
                    : {}),
                ...(dto.unitConversions
                    ? {
                        unitConversions: {
                            deleteMany: {},
                            create: dto.unitConversions.map((c) => ({
                                syncId: c.syncId ?? (0, node_crypto_1.randomUUID)(),
                                unitName: c.unitName,
                                conversionFactor: c.conversionFactor,
                                costPrice: c.costPrice,
                                sellingPrice: c.sellingPrice,
                            })),
                        },
                    }
                    : {}),
            },
            include: { unitConversions: true },
        });
    }
    async updateImage(productId, file) {
        const existing = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!existing || existing.isDeleted)
            throw new common_1.NotFoundException('Product not found');
        const imageUrl = `/uploads/products/${file.filename}`;
        const updated = await this.prisma.product.update({
            where: { id: productId },
            data: { imageUrl },
        });
        if (existing.imageUrl) {
            const oldFilename = existing.imageUrl.split('/').pop();
            if (oldFilename) {
                const oldPath = (0, node_path_1.join)(file.destination, oldFilename);
                (0, promises_1.unlink)(oldPath).catch(() => {
                });
            }
        }
        return updated;
    }
    async adjustStock(productId, dto) {
        return this.prisma.$transaction(async (client) => {
            const product = await client.product.findUnique({ where: { id: productId } });
            if (!product || product.isDeleted) {
                throw new common_1.NotFoundException('Product not found');
            }
            const previousQuantity = product.stockInBaseUnit;
            const newQuantity = previousQuantity + dto.quantityDelta;
            if (newQuantity < 0) {
                throw new common_1.BadRequestException('Stock quantity cannot go below zero');
            }
            const updatedProduct = await client.product.update({
                where: { id: productId },
                data: { stockInBaseUnit: newQuantity },
            });
            const movement = await client.stockMovement.create({
                data: {
                    productId,
                    movementType: dto.movementType ??
                        (dto.quantityDelta >= 0 ? client_1.StockMovementType.RESTOCK : client_1.StockMovementType.ADJUSTMENT),
                    quantity: dto.quantityDelta,
                    previousQuantity,
                    newQuantity,
                    note: dto.note ?? '',
                    reference: dto.reference ?? `INV-${(0, node_crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`,
                    ...(dto.expirationDate ? { expirationDate: new Date(dto.expirationDate) } : {}),
                },
            });
            return { product: updatedProduct, movement };
        });
    }
    async getMovements(productId) {
        await this.ensureProductExists(productId);
        return this.prisma.stockMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
    }
    async remove(productId) {
        await this.ensureProductExists(productId);
        return this.prisma.product.update({
            where: { id: productId },
            data: { isDeleted: true, isActive: false },
        });
    }
    async ensureProductExists(productId) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.isDeleted) {
            throw new common_1.NotFoundException('Product not found');
        }
    }
    async pushCategories(records) {
        await this.assertQuickAccessCapAfterPush(records);
        const results = [];
        for (const r of records) {
            const data = {
                name: r.name,
                description: r.description ?? '',
                examples: r.examples ?? '',
                isQuickAccess: r.isQuickAccess ?? false,
                isDeleted: r.isDeleted ?? false,
            };
            let item = await this.prisma.productCategory.findUnique({
                where: { syncId: r.syncId },
            });
            item ??= await this.prisma.productCategory.findUnique({
                where: { name: r.name },
            });
            if (item) {
                item = await this.prisma.productCategory.update({
                    where: { id: item.id },
                    data: { ...data, syncId: r.syncId },
                });
            }
            else {
                item = await this.prisma.productCategory.create({
                    data: { syncId: r.syncId, ...data },
                });
            }
            results.push(item);
        }
        return results;
    }
    async pullCategories(sinceMs) {
        const since = new Date(sinceMs);
        return this.prisma.productCategory.findMany({
            where: { updatedAt: { gte: since } },
            orderBy: { updatedAt: 'asc' },
        });
    }
    async listCategories() {
        return this.prisma.productCategory.findMany({
            where: { isDeleted: false },
            orderBy: [{ isQuickAccess: 'desc' }, { name: 'asc' }],
        });
    }
    async deleteCategory(id) {
        const existing = await this.prisma.productCategory.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Category not found');
        return this.prisma.productCategory.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    async assertQuickAccessCapAfterPush(records) {
        const incomingSyncIds = records.map((r) => r.syncId);
        const incomingPinnedSyncIds = new Set(records
            .filter((r) => r.isQuickAccess === true && r.isDeleted !== true)
            .map((r) => r.syncId));
        const otherPinned = await this.prisma.productCategory.count({
            where: {
                isQuickAccess: true,
                isDeleted: false,
                syncId: { notIn: incomingSyncIds },
            },
        });
        const total = otherPinned + incomingPinnedSyncIds.size;
        if (total > MAX_QUICK_ACCESS_CATEGORIES) {
            throw new common_1.BadRequestException({
                code: 'QUICK_ACCESS_LIMIT_EXCEEDED',
                message: `Only ${MAX_QUICK_ACCESS_CATEGORIES} categories can be pinned for quick access. Attempted total: ${total}.`,
                limit: MAX_QUICK_ACCESS_CATEGORIES,
                attempted: total,
            });
        }
    }
    async pushShelfLocations(records) {
        const results = [];
        for (const r of records) {
            const data = {
                name: r.name,
                description: r.description ?? '',
                examples: r.examples ?? '',
                isDeleted: r.isDeleted ?? false,
            };
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
            }
            else {
                item = await this.prisma.shelfLocation.create({
                    data: { syncId: r.syncId, ...data },
                });
            }
            results.push(item);
        }
        return results;
    }
    async pullShelfLocations(sinceMs) {
        const since = new Date(sinceMs);
        return this.prisma.shelfLocation.findMany({
            where: { updatedAt: { gte: since } },
            orderBy: { updatedAt: 'asc' },
        });
    }
    async listShelfLocations() {
        return this.prisma.shelfLocation.findMany({
            where: { isDeleted: false },
            orderBy: { name: 'asc' },
        });
    }
    async deleteShelfLocation(id) {
        const existing = await this.prisma.shelfLocation.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Shelf location not found');
        return this.prisma.shelfLocation.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    async updateShelfLocationImage(id, file) {
        const existing = await this.prisma.shelfLocation.findUnique({ where: { id } });
        if (!existing || existing.isDeleted)
            throw new common_1.NotFoundException('Shelf location not found');
        const imageUrl = await this.storage.uploadFile(file, 'uploads/shelf-locations');
        const updated = await this.prisma.shelfLocation.update({
            where: { id },
            data: { imageUrl },
        });
        if (existing.imageUrl) {
            const oldFilename = existing.imageUrl.split('/').pop();
            if (oldFilename) {
                const oldPath = (0, node_path_1.join)(file.destination, oldFilename);
                (0, promises_1.unlink)(oldPath).catch(() => { });
            }
        }
        return updated;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(storage_provider_interface_js_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService, Object])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map