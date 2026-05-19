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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
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
        });
    }
    async update(productId, dto) {
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
    async adjustStock(productId, dto) {
        return this.prisma.$transaction(async (client) => {
            const product = await client.product.findUnique({ where: { id: productId } });
            if (!product || product.isDeleted) {
                throw new common_1.NotFoundException('Product not found');
            }
            const previousQuantity = product.stockQuantity;
            const newQuantity = previousQuantity + dto.quantityDelta;
            if (newQuantity < 0) {
                throw new common_1.NotFoundException('Stock quantity cannot go below zero');
            }
            const updatedProduct = await client.product.update({
                where: { id: productId },
                data: { stockQuantity: newQuantity },
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
                },
            });
            return { product: updatedProduct, movement };
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map