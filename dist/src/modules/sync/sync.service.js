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
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
let SyncService = SyncService_1 = class SyncService {
    prisma;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async pushAndPull(deviceId, userId, lastSync, push) {
        const isIncremental = lastSync !== undefined && lastSync > 0;
        const sinceDate = isIncremental ? new Date(lastSync) : new Date(0);
        const serverTimestamp = Date.now();
        const pullWhere = (hasDeviceId, hasIsDeleted) => {
            if (isIncremental) {
                return {
                    userId,
                    updatedAt: { gt: sinceDate },
                    ...(hasDeviceId && deviceId ? { deviceId: { not: deviceId } } : {}),
                };
            }
            return {
                userId,
                ...(hasIsDeleted ? { isDeleted: false } : {}),
            };
        };
        const validUuid = (id) => typeof id === 'string' && id.length > 0 ? id : undefined;
        await this.prisma.$transaction(async (tx) => {
            await tx.deviceSync.upsert({
                where: { deviceId },
                update: { lastSyncedAt: new Date(serverTimestamp) },
                create: { deviceId, lastSyncedAt: new Date(serverTimestamp) },
            });
            if (push.productCategories && push.productCategories.length > 0) {
                const syncIds = push.productCategories.map((r) => r.syncId);
                const names = push.productCategories.map((r) => r.name);
                const [existingBySyncId, existingByName] = await Promise.all([
                    tx.productCategory.findMany({ where: { syncId: { in: syncIds } } }),
                    tx.productCategory.findMany({ where: { userId, name: { in: names } } }),
                ]);
                const existingMap = new Map(existingBySyncId.map((x) => [x.syncId, x]));
                const nameMap = new Map(existingByName.map((x) => [x.name, x]));
                for (const r of push.productCategories) {
                    const existing = existingMap.get(r.syncId) ?? nameMap.get(r.name);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify ProductCategory ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            this.logger.warn(`Sync conflict: ProductCategory (syncId: ${r.syncId}) rejected — server record is newer.`);
                            continue;
                        }
                    }
                    if (r.isQuickAccess && !r.isDeleted) {
                        const count = await tx.productCategory.count({
                            where: {
                                userId,
                                isQuickAccess: true,
                                isDeleted: false,
                                syncId: { not: r.syncId },
                            },
                        });
                        if (count >= 10)
                            r.isQuickAccess = false;
                    }
                    const data = {
                        userId,
                        name: r.name,
                        description: r.description ?? '',
                        examples: r.examples ?? '',
                        isQuickAccess: r.isQuickAccess ?? false,
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.productCategory.update({
                            where: { id: existing.id },
                            data: { ...data, syncId: r.syncId },
                        });
                    }
                    else {
                        await tx.productCategory.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.shelfLocations && push.shelfLocations.length > 0) {
                const syncIds = push.shelfLocations.map((r) => r.syncId);
                const names = push.shelfLocations.map((r) => r.name);
                const [existingBySyncId, existingByName] = await Promise.all([
                    tx.shelfLocation.findMany({ where: { syncId: { in: syncIds } } }),
                    tx.shelfLocation.findMany({ where: { userId, name: { in: names } } }),
                ]);
                const existingMap = new Map(existingBySyncId.map((x) => [x.syncId, x]));
                const nameMap = new Map(existingByName.map((x) => [x.name, x]));
                for (const r of push.shelfLocations) {
                    const existing = existingMap.get(r.syncId) ?? nameMap.get(r.name);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify ShelfLocation ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        name: r.name,
                        description: r.description ?? '',
                        examples: r.examples ?? '',
                        isDeleted: r.isDeleted ?? false,
                        imageUrl: r.imageUrl ?? null,
                    };
                    if (existing) {
                        await tx.shelfLocation.update({
                            where: { id: existing.id },
                            data: { ...data, syncId: r.syncId },
                        });
                    }
                    else {
                        await tx.shelfLocation.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.products && push.products.length > 0) {
                const syncIds = push.products.map((r) => r.syncId).filter((id) => !!id);
                const skus = push.products.map((r) => r.sku);
                const [existingBySyncId, existingBySku] = await Promise.all([
                    tx.product.findMany({ where: { syncId: { in: syncIds } } }),
                    tx.product.findMany({ where: { userId, sku: { in: skus } } }),
                ]);
                const existingMap = new Map(existingBySyncId.map((x) => [x.syncId, x]));
                const skuMap = new Map(existingBySku.map((x) => [x.sku, x]));
                for (const r of push.products) {
                    const existing = existingMap.get(r.syncId) ?? skuMap.get(r.sku);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify Product ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId ?? null,
                        name: r.name,
                        sku: r.sku,
                        description: r.description ?? '',
                        category: r.category ?? 'General',
                        baseUnit: r.baseUnit ?? 'pcs',
                        costPrice: r.costPrice ?? 0,
                        sellingPrice: r.sellingPrice,
                        stockInBaseUnit: r.stockInBaseUnit ?? 0,
                        reorderPoint: r.reorderPoint ?? 0,
                        isActive: r.isActive ?? true,
                        isDeleted: r.isDeleted ?? false,
                        imageUrl: r.imageUrl ?? null,
                        shelfLocation: r.shelfLocation ?? 'Counter',
                        expirationDate: r.expirationDate ? new Date(r.expirationDate) : null,
                        categoryId: r.categoryId ?? null,
                        shelfLocationId: r.shelfLocationId ?? null,
                        itemType: r.itemType ?? 'standard',
                        customAttributes: r.customAttributes ?? {},
                    };
                    if (existing) {
                        await tx.product.update({
                            where: { id: existing.id },
                            data: { ...data, syncId: r.syncId },
                        });
                    }
                    else {
                        await tx.product.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.productUnitConversions && push.productUnitConversions.length > 0) {
                const syncIds = push.productUnitConversions.map((r) => r.syncId);
                const existingRecords = await tx.productUnitConversion.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.productUnitConversions) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify ProductUnitConversion ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        productId: r.productId,
                        unitName: r.unitName,
                        conversionFactor: r.conversionFactor,
                        costPrice: r.costPrice,
                        sellingPrice: r.sellingPrice,
                    };
                    if (existing) {
                        await tx.productUnitConversion.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.productUnitConversion.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.productSerialNumbers && push.productSerialNumbers.length > 0) {
                const syncIds = push.productSerialNumbers.map((r) => r.syncId);
                const existingRecords = await tx.productSerialNumber.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.productSerialNumbers) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify ProductSerialNumber ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        productId: r.productId,
                        serialNumber: r.serialNumber,
                        status: r.status ?? 'AVAILABLE',
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.productSerialNumber.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.productSerialNumber.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.productRecipeIngredients && push.productRecipeIngredients.length > 0) {
                const syncIds = push.productRecipeIngredients.map((r) => r.syncId);
                const existingRecords = await tx.productRecipeIngredient.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.productRecipeIngredients) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify ProductRecipeIngredient ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        recipeProductId: r.recipeProductId,
                        ingredientProductId: r.ingredientProductId,
                        quantityNeeded: r.quantityNeeded,
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.productRecipeIngredient.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.productRecipeIngredient.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.customers && push.customers.length > 0) {
                const syncIds = push.customers.map((r) => r.syncId);
                const existingRecords = await tx.customer.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.customers) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify Customer ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId ?? null,
                        name: r.name,
                        phone: r.phone ?? '',
                        address: r.address ?? '',
                        notes: r.notes ?? '',
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.customer.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.customer.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.utangRecords && push.utangRecords.length > 0) {
                const syncIds = push.utangRecords.map((r) => r.syncId);
                const existingRecords = await tx.utangRecord.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.utangRecords) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify UtangRecord ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId ?? null,
                        customerId: r.customerId,
                        description: r.description ?? '',
                        amount: r.amount,
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.utangRecord.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.utangRecord.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.sales && push.sales.length > 0) {
                const syncIds = push.sales.map((r) => r.syncId);
                const existingRecords = await tx.sale.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.sales) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify Sale ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
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
                    let saleId;
                    if (existing) {
                        await tx.sale.update({ where: { id: existing.id }, data: saleData });
                        saleId = existing.id;
                        await tx.saleItem.deleteMany({ where: { saleId } });
                    }
                    else {
                        const created = await tx.sale.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...saleData },
                        });
                        saleId = created.id;
                    }
                    if (r.items && r.items.length > 0) {
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
                }
            }
            if (push.charges && push.charges.length > 0) {
                const syncIds = push.charges.map((r) => r.syncId);
                const existingRecords = await tx.charge.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.charges) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify Charge ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId,
                        lowerBound: r.lowerBound,
                        upperBound: r.upperBound,
                        chargeAmount: r.chargeAmount,
                        transactionTypeKey: r.transactionTypeKey ?? 'gcash_cashin',
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.charge.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.charge.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.parties && push.parties.length > 0) {
                const syncIds = push.parties.map((r) => r.syncId);
                const existingRecords = await tx.party.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.parties) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify Party ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId,
                        name: r.name,
                        accountNumber: r.accountNumber,
                        entityId: r.entityId ?? '',
                        description: r.description ?? '',
                        joinDate: r.joinDate,
                        isVerified: r.isVerified ?? false,
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.party.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.party.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.transactionTypes && push.transactionTypes.length > 0) {
                const syncIds = push.transactionTypes.map((r) => r.syncId);
                const existingRecords = await tx.transactionType.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.transactionTypes) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify TransactionType ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId,
                        name: r.name,
                        isOutflow: r.isOutflow ?? false,
                        walletAccount: r.walletAccount ?? 'GCash',
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.transactionType.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.transactionType.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.movementCategories && push.movementCategories.length > 0) {
                const syncIds = push.movementCategories.map((r) => r.syncId);
                const existingRecords = await tx.movementCategory.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.movementCategories) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify MovementCategory ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId,
                        name: r.name,
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.movementCategory.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.movementCategory.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.feeTransactions && push.feeTransactions.length > 0) {
                const syncIds = push.feeTransactions.map((r) => r.syncId);
                const existingRecords = await tx.feeTransaction.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.feeTransactions) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify FeeTransaction ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId,
                        relatedTransactionSyncId: r.relatedTransactionSyncId ?? null,
                        feeAmount: r.feeAmount,
                        feeType: r.feeType,
                        chargeDestination: r.chargeDestination,
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.feeTransaction.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.feeTransaction.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.transactions && push.transactions.length > 0) {
                const syncIds = push.transactions.map((r) => r.syncId);
                const existingRecords = await tx.transaction.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.transactions) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify Transaction ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId ?? null,
                        walletProvider: r.walletProvider,
                        direction: r.direction,
                        amount: r.amount,
                        chargeAmount: r.chargeAmount ?? 0,
                        totalAmount: r.totalAmount,
                        balanceBefore: r.balanceBefore,
                        balanceAfter: r.balanceAfter,
                        chargeLowerBound: r.chargeLowerBound ?? null,
                        chargeUpperBound: r.chargeUpperBound ?? null,
                        chargeHandling: r.chargeHandling ?? 'addOnTop',
                        receiptImagePath: r.receiptImagePath ?? null,
                        receiptOriginalName: r.receiptOriginalName ?? null,
                        receiptMimeType: r.receiptMimeType ?? null,
                        receiptUploadedAt: r.receiptUploadedAt ? new Date(r.receiptUploadedAt) : null,
                        ocrStatus: r.ocrStatus ?? client_1.OcrStatus.PENDING,
                        ocrExtractedAmount: r.ocrExtractedAmount ?? null,
                        ocrRawText: r.ocrRawText ?? null,
                        ocrProcessedAt: r.ocrProcessedAt ? new Date(r.ocrProcessedAt) : null,
                        externalProvider: r.externalProvider ?? null,
                        externalTransactionId: r.externalTransactionId ?? null,
                        note: r.note ?? '',
                        reference: r.reference ?? '',
                        entryDate: r.entryDate ?? r.updatedAt ?? new Date().toISOString(),
                        status: r.status ?? client_1.TransactionStatus.COMPLETED,
                    };
                    if (existing) {
                        await tx.transaction.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.transaction.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.ledgerEntries && push.ledgerEntries.length > 0) {
                const syncIds = push.ledgerEntries.map((r) => r.syncId);
                const existingRecords = await tx.ledgerEntry.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.ledgerEntries) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify LedgerEntry ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        transactionId: r.transactionId ?? null,
                        deviceId: r.deviceId,
                        entryType: r.entryType,
                        title: r.title ?? '',
                        note: r.note ?? '',
                        reference: r.reference ?? '',
                        amount: r.amount,
                        walletDelta: r.walletDelta ?? 0,
                        mayaWalletDelta: r.mayaWalletDelta ?? 0,
                        onHandDelta: r.onHandDelta ?? 0,
                        recordedFlow: r.recordedFlow ?? 0,
                        tag: r.tag ?? '',
                        iconKey: r.iconKey ?? '',
                        walletAccount: r.walletAccount ?? '',
                        ownerScope: r.ownerScope ?? 'Business',
                        ownerMovementType: r.ownerMovementType ?? null,
                        ownerCategory: r.ownerCategory ?? null,
                        ownerPartyName: r.ownerPartyName ?? null,
                        ownerPartyAccount: r.ownerPartyAccount ?? null,
                        entryDate: r.entryDate ?? r.updatedAt ?? new Date().toISOString(),
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.ledgerEntry.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.ledgerEntry.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
            if (push.businessProfiles && push.businessProfiles.length > 0) {
                const syncIds = push.businessProfiles.map((r) => r.syncId);
                const existingRecords = await tx.businessProfile.findMany({
                    where: { syncId: { in: syncIds } },
                });
                const existingMap = new Map(existingRecords.map((x) => [x.syncId, x]));
                for (const r of push.businessProfiles) {
                    const existing = existingMap.get(r.syncId);
                    let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
                    if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
                        incomingUpdatedAt = new Date();
                    }
                    if (existing) {
                        if (existing.userId !== userId) {
                            this.logger.warn(`Security Warning: User ${userId} attempted to modify BusinessProfile ${r.syncId} owned by User ${existing.userId}`);
                            continue;
                        }
                        if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
                            continue;
                        }
                    }
                    const data = {
                        userId,
                        deviceId: r.deviceId,
                        businessType: r.businessType,
                        businessName: r.businessName,
                        defaultCurrency: r.defaultCurrency ?? 'PHP',
                        preferences: r.preferences ?? {},
                        isDeleted: r.isDeleted ?? false,
                    };
                    if (existing) {
                        await tx.businessProfile.update({ where: { id: existing.id }, data });
                    }
                    else {
                        await tx.businessProfile.create({
                            data: { ...(validUuid(r.id) ? { id: validUuid(r.id) } : {}), syncId: r.syncId, ...data },
                        });
                    }
                }
            }
        });
        this.logger.log(`Push complete for device: ${deviceId}, user: ${userId}`);
        const pullData = await this.prisma.$transaction(async (tx) => {
            const productCategories = await tx.productCategory.findMany({
                where: pullWhere(false, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const shelfLocations = await tx.shelfLocation.findMany({
                where: pullWhere(false, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const products = await tx.product.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const productUnitConversions = await tx.productUnitConversion.findMany({
                where: pullWhere(false, false),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const customers = await tx.customer.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const utangRecords = await tx.utangRecord.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const sales = await tx.sale.findMany({
                where: pullWhere(true, true),
                include: { saleItems: true },
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const charges = await tx.charge.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const parties = await tx.party.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const transactionTypes = await tx.transactionType.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const movementCategories = await tx.movementCategory.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const feeTransactions = await tx.feeTransaction.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const transactions = await tx.transaction.findMany({
                where: pullWhere(true, false),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const ledgerEntries = await tx.ledgerEntry.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const businessProfiles = await tx.businessProfile.findMany({
                where: pullWhere(true, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const productSerialNumbers = await tx.productSerialNumber.findMany({
                where: pullWhere(false, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const productRecipeIngredients = await tx.productRecipeIngredient.findMany({
                where: pullWhere(false, true),
                orderBy: { updatedAt: 'asc' },
                take: 500,
            });
            const mappedSales = sales.map(({ saleItems, ...sale }) => ({
                ...sale,
                items: saleItems,
            }));
            return {
                productCategories,
                shelfLocations,
                products,
                productUnitConversions,
                customers,
                utangRecords,
                sales: mappedSales,
                charges,
                parties,
                transactionTypes,
                movementCategories,
                feeTransactions,
                transactions,
                ledgerEntries,
                businessProfiles,
                productSerialNumbers,
                productRecipeIngredients,
            };
        });
        return {
            success: true,
            timestamp: serverTimestamp,
            pull: pullData,
        };
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], SyncService);
//# sourceMappingURL=sync.service.js.map