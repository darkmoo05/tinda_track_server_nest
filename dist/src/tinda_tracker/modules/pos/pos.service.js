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
    async checkout(userId, dto) {
        if (dto.paidAmount < 0) {
            throw new common_1.BadRequestException('Paid amount must be zero or greater');
        }
        return this.prisma.$transaction(async (client) => {
            const uniqueProductIds = [...new Set(dto.items.map((item) => item.productId))];
            const [products, conversions] = await Promise.all([
                client.product.findMany({
                    where: { id: { in: uniqueProductIds }, userId, isDeleted: false, isActive: true },
                }),
                client.productUnitConversion.findMany({
                    where: { productId: { in: uniqueProductIds }, userId },
                }),
            ]);
            if (products.length !== uniqueProductIds.length) {
                throw new common_1.NotFoundException('One or more products were not found');
            }
            const productById = new Map(products.map((product) => [product.id, product]));
            const conversionsByProductId = new Map();
            for (const conversion of conversions) {
                const list = conversionsByProductId.get(conversion.productId) ?? [];
                list.push(conversion);
                conversionsByProductId.set(conversion.productId, list);
            }
            const lineItems = dto.items.map((item) => {
                const product = productById.get(item.productId);
                if (!product) {
                    throw new common_1.NotFoundException(`Product ${item.productId} not found`);
                }
                if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
                    throw new common_1.BadRequestException('Please enter a valid quantity greater than zero for each item.');
                }
                const selectedUnit = (item.selectedUnit?.trim() || product.baseUnit).toLowerCase();
                const baseUnit = product.baseUnit.toLowerCase();
                const matchedConversion = (conversionsByProductId.get(product.id) ?? []).find((c) => c.unitName.toLowerCase() === selectedUnit);
                const conversionFactor = selectedUnit === baseUnit
                    ? 1
                    : matchedConversion?.conversionFactor;
                if (!conversionFactor || conversionFactor <= 0) {
                    throw new common_1.BadRequestException(`Unit \"${item.selectedUnit ?? product.baseUnit}\" is not configured for ${product.name}.`);
                }
                const computedBaseQuantity = item.computedBaseQuantity ?? item.quantity * conversionFactor;
                if (computedBaseQuantity <= 0) {
                    throw new common_1.BadRequestException('Computed stock quantity must be greater than zero.');
                }
                const appliedUnitPrice = item.unitPrice ??
                    (selectedUnit === baseUnit
                        ? product.sellingPrice
                        : Number(matchedConversion?.sellingPrice ?? product.sellingPrice));
                if (appliedUnitPrice < 0) {
                    throw new common_1.BadRequestException('Unit price cannot be negative.');
                }
                if (product.stockInBaseUnit < computedBaseQuantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
                }
                const lineTotal = appliedUnitPrice * item.quantity;
                return {
                    item,
                    product,
                    selectedUnit: item.selectedUnit?.trim() || product.baseUnit,
                    appliedUnitPrice,
                    computedBaseQuantity,
                    lineTotal,
                };
            });
            const deductionByProductId = new Map();
            for (const entry of lineItems) {
                deductionByProductId.set(entry.product.id, (deductionByProductId.get(entry.product.id) ?? 0) + entry.computedBaseQuantity);
            }
            for (const [productId, totalDeduction] of deductionByProductId.entries()) {
                const product = productById.get(productId);
                if (!product || product.stockInBaseUnit < totalDeduction) {
                    throw new common_1.BadRequestException(`Kulang ang stocks for ${product?.name ?? 'this product'}. Please reduce the quantity.`);
                }
            }
            const subtotal = lineItems.reduce((sum, entry) => sum + entry.lineTotal, 0);
            if (dto.paidAmount < subtotal) {
                throw new common_1.BadRequestException('Paid amount is less than sale total');
            }
            const changeAmount = dto.paidAmount - subtotal;
            const totalItems = lineItems.length;
            const reference = dto.reference?.trim() || this.buildReference();
            const sale = await client.sale.create({
                data: {
                    userId,
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
                await client.saleItem.create({
                    data: {
                        saleId: sale.id,
                        productId: entry.product.id,
                        selectedUnit: entry.selectedUnit,
                        quantity: entry.item.quantity,
                        unitPrice: entry.appliedUnitPrice,
                        computedBaseQuantity: entry.computedBaseQuantity,
                        lineTotal: entry.lineTotal,
                    },
                });
            }
            for (const [productId, deduction] of deductionByProductId.entries()) {
                const product = productById.get(productId);
                if (!product)
                    continue;
                const previousQuantity = product.stockInBaseUnit;
                const updateResult = await client.product.updateMany({
                    where: { id: productId, userId, stockInBaseUnit: { gte: deduction } },
                    data: { stockInBaseUnit: { decrement: deduction } },
                });
                if (updateResult.count === 0) {
                    throw new common_1.BadRequestException(`Kulang ang stocks for ${product.name}. Please refresh and try again.`);
                }
                const updatedProduct = await client.product.findUnique({
                    where: { id: productId },
                    select: { stockInBaseUnit: true },
                });
                const newQuantity = updatedProduct?.stockInBaseUnit ?? previousQuantity - deduction;
                await client.stockMovement.create({
                    data: {
                        productId,
                        movementType: client_1.StockMovementType.SALE,
                        quantity: -deduction,
                        previousQuantity,
                        newQuantity,
                        note: dto.note ?? '',
                        reference,
                    },
                });
            }
            await client.ledgerEntry.create({
                data: {
                    userId,
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
    async listSales(userId, query) {
        const fromDate = query.from ? new Date(query.from) : undefined;
        const toDate = query.to ? new Date(query.to) : undefined;
        return this.prisma.sale.findMany({
            where: {
                userId,
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
    async getDashboardStats(userId) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        const [todaySales, lowStockProducts, weekSales, totalUtang] = await Promise.all([
            this.prisma.sale.findMany({
                where: { userId, createdAt: { gte: todayStart, lte: todayEnd } },
                include: { saleItems: { include: { product: true } } },
            }),
            this.prisma.product.findMany({
                where: { userId, isDeleted: false, isActive: true },
                select: {
                    id: true,
                    name: true,
                    stockInBaseUnit: true,
                    reorderPoint: true,
                    sellingPrice: true,
                },
            }),
            this.prisma.sale.findMany({
                where: { userId, createdAt: { gte: weekStart } },
                include: { saleItems: { include: { product: true } } },
            }),
            this.prisma.utangRecord.aggregate({
                where: { userId, isDeleted: false },
                _sum: { amount: true },
            }),
        ]);
        const todayTotalSales = todaySales.reduce((s, sale) => s + sale.totalAmount, 0);
        const todayProfit = todaySales.reduce((s, sale) => {
            const profit = sale.saleItems.reduce((sp, item) => {
                const cost = item.product.costPrice ?? 0;
                return sp + (Number(item.unitPrice) - cost) * item.quantity;
            }, 0);
            return s + profit;
        }, 0);
        const lowStock = lowStockProducts.filter((p) => p.stockInBaseUnit <= p.reorderPoint);
        const productSalesMap = new Map();
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
    async getReports(userId, query) {
        const fromDate = query.from ? new Date(query.from) : (() => { const d = new Date(); d.setDate(d.getDate() - 29); d.setHours(0, 0, 0, 0); return d; })();
        const toDate = query.to ? new Date(query.to) : new Date();
        const sales = await this.prisma.sale.findMany({
            where: { userId, createdAt: { gte: fromDate, lte: toDate } },
            include: { saleItems: { include: { product: true } } },
            orderBy: { createdAt: 'asc' },
        });
        const totalSales = sales.reduce((s, sale) => s + sale.totalAmount, 0);
        const totalProfit = sales.reduce((s, sale) => {
            return s + sale.saleItems.reduce((sp, item) => {
                return sp + (Number(item.unitPrice) - (item.product.costPrice ?? 0)) * item.quantity;
            }, 0);
        }, 0);
        const dailyMap = new Map();
        for (const sale of sales) {
            const dateKey = sale.createdAt.toISOString().slice(0, 10);
            const existing = dailyMap.get(dateKey) ?? { date: dateKey, sales: 0, profit: 0, transactions: 0 };
            existing.sales += sale.totalAmount;
            existing.profit += sale.saleItems.reduce((sp, item) => {
                return sp + (Number(item.unitPrice) - (item.product.costPrice ?? 0)) * item.quantity;
            }, 0);
            existing.transactions++;
            dailyMap.set(dateKey, existing);
        }
        const productMap = new Map();
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
    buildReference() {
        return `SALE-${(0, node_crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
    }
    async pushSales(userId, records) {
        let synced = 0;
        for (const r of records) {
            const existing = await this.prisma.sale.findUnique({
                where: { syncId: r.syncId },
            });
            let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
            if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                incomingUpdatedAt = new Date();
            }
            if (existing && existing.updatedAt > incomingUpdatedAt)
                continue;
            const saleData = {
                userId,
                reference: r.reference,
                deviceId: r.deviceId ?? null,
                note: r.note ?? '',
                subtotal: r.subtotal,
                totalAmount: r.totalAmount,
                paidAmount: r.paidAmount,
                changeAmount: r.changeAmount ?? 0,
                totalItems: r.totalItems,
                isDeleted: r.isDeleted ?? false,
            };
            await this.prisma.$transaction(async (tx) => {
                let saleId;
                if (existing) {
                    await tx.sale.update({ where: { id: existing.id }, data: saleData });
                    saleId = existing.id;
                    await tx.saleItem.deleteMany({ where: { saleId } });
                }
                else {
                    const created = await tx.sale.create({
                        data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...saleData },
                    });
                    saleId = created.id;
                }
                if (r.items.length > 0) {
                    await tx.saleItem.createMany({
                        data: r.items.map((i) => ({
                            saleId,
                            productId: i.productId,
                            selectedUnit: i.selectedUnit,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            computedBaseQuantity: i.computedBaseQuantity,
                            lineTotal: i.lineTotal,
                            createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
                        })),
                    });
                }
            });
            synced++;
        }
        return synced;
    }
    async pullSales(userId, query) {
        const sinceMs = Number(query.since ?? '0');
        const isIncremental = Number.isFinite(sinceMs) && sinceMs > 0;
        const rows = await this.prisma.sale.findMany({
            where: isIncremental
                ? {
                    userId,
                    updatedAt: { gt: new Date(sinceMs) },
                    ...(query.deviceId ? { deviceId: { not: query.deviceId } } : {}),
                }
                : { userId, isDeleted: false },
            include: { saleItems: true },
            orderBy: isIncremental ? { updatedAt: 'asc' } : { createdAt: 'asc' },
        });
        return rows.map(({ saleItems, ...sale }) => ({ ...sale, items: saleItems }));
    }
};
exports.PosService = PosService;
exports.PosService = PosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], PosService);
//# sourceMappingURL=pos.service.js.map