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
exports.PosService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
let PosService = class PosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkout(dto) {
        if (dto.paidAmount < 0) {
            throw new common_1.BadRequestException('Paid amount must be zero or greater');
        }
        return this.prisma.$transaction(async (client) => {
            const uniqueProductIds = [...new Set(dto.items.map((item) => item.productId))];
            const products = await client.product.findMany({
                where: { id: { in: uniqueProductIds }, isDeleted: false, isActive: true },
            });
            if (products.length !== uniqueProductIds.length) {
                throw new common_1.NotFoundException('One or more products were not found');
            }
            const productById = new Map(products.map((product) => [product.id, product]));
            const lineItems = dto.items.map((item) => {
                const product = productById.get(item.productId);
                if (!product) {
                    throw new common_1.NotFoundException(`Product ${item.productId} not found`);
                }
                if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                    throw new common_1.BadRequestException('Each checkout item must have a positive whole-number quantity');
                }
                if (product.stockQuantity < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
                }
                const lineTotal = product.sellingPrice * item.quantity;
                return { item, product, lineTotal };
            });
            const subtotal = lineItems.reduce((sum, entry) => sum + entry.lineTotal, 0);
            if (dto.paidAmount < subtotal) {
                throw new common_1.BadRequestException('Paid amount is less than sale total');
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
                        movementType: client_1.StockMovementType.SALE,
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
                    syncId: `${sale.id}-sale-${(0, node_crypto_1.randomUUID)()}`,
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
    async listSales(query) {
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
    buildReference() {
        return `SALE-${(0, node_crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
    }
};
exports.PosService = PosService;
exports.PosService = PosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], PosService);
//# sourceMappingURL=pos.service.js.map