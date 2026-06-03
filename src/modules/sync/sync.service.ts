import { Injectable, Logger } from '@nestjs/common';
import {
  OcrStatus,
  TransactionStatus,
  ProductCategory,
  ShelfLocation,
  Product,
  ProductUnitConversion,
  Customer,
  UtangRecord,
  Sale,
  Charge,
  Party,
  TransactionType,
  MovementCategory,
  FeeTransaction,
  Transaction,
  LedgerEntry,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SyncPushDto } from './dto/sync.dto.js';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async pushAndPull(
    deviceId: string,
    userId: string,
    lastSync: number | undefined,
    push: SyncPushDto,
  ) {
    const isIncremental = lastSync !== undefined && lastSync > 0;
    const sinceDate = isIncremental ? new Date(lastSync) : new Date(0);
    const serverTimestamp = Date.now();

    // ── Pull-filter helper ────────────────────────────────────────────────────
    const pullWhere = (hasDeviceId: boolean, hasIsDeleted: boolean) => {
      if (isIncremental) {
        // Incremental: return ALL changes (including soft-deletes) so clients can reconcile.
        // Prisma 7 Boolean fields do NOT support the `in` operator — omit isDeleted filter
        // entirely to return both deleted and non-deleted records in differential pulls.
        return {
          userId,
          updatedAt: { gt: sinceDate },
          ...(hasDeviceId && deviceId ? { deviceId: { not: deviceId } } : {}),
        };
      }
      // Full sync: only return active (non-deleted) records to give clients a clean slate.
      return {
        userId,
        ...(hasIsDeleted ? { isDeleted: false } : {}),
      };
    };

    // ── Push — upsert every entity sent by the device ────────────────────────
    // Guard: only pass `id` to Prisma if it's a non-empty UUID string.
    // Legacy SQLite clients may send integer autoincrement IDs which Prisma rejects.
    const validUuid = (id: unknown): string | undefined =>
      typeof id === 'string' && id.length > 0 ? id : undefined;

    await this.prisma.$transaction(async (tx) => {
      // Track or update the lastSyncedAt per device
      await tx.deviceSync.upsert({
        where: { deviceId },
        update: { lastSyncedAt: new Date(serverTimestamp) },
        create: { deviceId, lastSyncedAt: new Date(serverTimestamp) },
      });

      // 1. ProductCategory
      if (push.productCategories && push.productCategories.length > 0) {
        const syncIds = push.productCategories.map((r) => r.syncId);
        const names = push.productCategories.map((r) => r.name);

        const [existingBySyncId, existingByName] = await Promise.all([
          tx.productCategory.findMany({ where: { syncId: { in: syncIds } } }),
          tx.productCategory.findMany({ where: { userId, name: { in: names } } }),
        ]);

        const existingMap = new Map<string, ProductCategory>(
          existingBySyncId.map((x) => [x.syncId, x]),
        );
        const nameMap = new Map<string, ProductCategory>(
          existingByName.map((x) => [x.name, x]),
        );

        for (const r of push.productCategories) {
          const existing = existingMap.get(r.syncId) ?? nameMap.get(r.name);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify ProductCategory ${r.syncId} owned by User ${existing.userId}`,
              );
              continue;
            }
            if (existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
              this.logger.warn(
                `Sync conflict: ProductCategory (syncId: ${r.syncId}) rejected — server record is newer.`,
              );
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
            if (count >= 10) r.isQuickAccess = false;
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
          } else {
            await tx.productCategory.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 2. ShelfLocation
      if (push.shelfLocations && push.shelfLocations.length > 0) {
        const syncIds = push.shelfLocations.map((r) => r.syncId);
        const names = push.shelfLocations.map((r) => r.name);

        const [existingBySyncId, existingByName] = await Promise.all([
          tx.shelfLocation.findMany({ where: { syncId: { in: syncIds } } }),
          tx.shelfLocation.findMany({ where: { userId, name: { in: names } } }),
        ]);

        const existingMap = new Map<string, ShelfLocation>(
          existingBySyncId.map((x) => [x.syncId, x]),
        );
        const nameMap = new Map<string, ShelfLocation>(
          existingByName.map((x) => [x.name, x]),
        );

        for (const r of push.shelfLocations) {
          const existing = existingMap.get(r.syncId) ?? nameMap.get(r.name);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify ShelfLocation ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.shelfLocation.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 3. Product
      if (push.products && push.products.length > 0) {
        const syncIds = push.products.map((r) => r.syncId).filter((id): id is string => !!id);
        const skus = push.products.map((r) => r.sku);

        const [existingBySyncId, existingBySku] = await Promise.all([
          tx.product.findMany({ where: { syncId: { in: syncIds } } }),
          tx.product.findMany({ where: { userId, sku: { in: skus } } }),
        ]);

        const existingMap = new Map<string, Product>(
          existingBySyncId.map((x) => [x.syncId!, x]),
        );
        const skuMap = new Map<string, Product>(
          existingBySku.map((x) => [x.sku, x]),
        );

        for (const r of push.products) {
          const existing = existingMap.get(r.syncId!) ?? skuMap.get(r.sku);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify Product ${r.syncId} owned by User ${existing.userId}`,
              );
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
          };
          if (existing) {
            await tx.product.update({
              where: { id: existing.id },
              data: { ...data, syncId: r.syncId },
            });
          } else {
            await tx.product.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 4. ProductUnitConversion
      if (push.productUnitConversions && push.productUnitConversions.length > 0) {
        const syncIds = push.productUnitConversions.map((r) => r.syncId);
        const existingRecords = await tx.productUnitConversion.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, ProductUnitConversion>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.productUnitConversions) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify ProductUnitConversion ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.productUnitConversion.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 5. Customer
      if (push.customers && push.customers.length > 0) {
        const syncIds = push.customers.map((r) => r.syncId);
        const existingRecords = await tx.customer.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, Customer>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.customers) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify Customer ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.customer.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 6. UtangRecord
      if (push.utangRecords && push.utangRecords.length > 0) {
        const syncIds = push.utangRecords.map((r) => r.syncId);
        const existingRecords = await tx.utangRecord.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, UtangRecord>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.utangRecords) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify UtangRecord ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.utangRecord.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 7. Sale
      if (push.sales && push.sales.length > 0) {
        const syncIds = push.sales.map((r) => r.syncId);
        const existingRecords = await tx.sale.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, Sale>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.sales) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify Sale ${r.syncId} owned by User ${existing.userId}`,
              );
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
          let saleId: string;
          if (existing) {
            await tx.sale.update({ where: { id: existing.id }, data: saleData });
            saleId = existing.id;
            await tx.saleItem.deleteMany({ where: { saleId } });
          } else {
            const created = await tx.sale.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...saleData },
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

      // 8. Charge
      if (push.charges && push.charges.length > 0) {
        const syncIds = push.charges.map((r) => r.syncId);
        const existingRecords = await tx.charge.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, Charge>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.charges) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify Charge ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.charge.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 9. Party
      if (push.parties && push.parties.length > 0) {
        const syncIds = push.parties.map((r) => r.syncId);
        const existingRecords = await tx.party.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, Party>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.parties) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify Party ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.party.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 10. TransactionType
      if (push.transactionTypes && push.transactionTypes.length > 0) {
        const syncIds = push.transactionTypes.map((r) => r.syncId);
        const existingRecords = await tx.transactionType.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, TransactionType>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.transactionTypes) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify TransactionType ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.transactionType.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 11. MovementCategory
      if (push.movementCategories && push.movementCategories.length > 0) {
        const syncIds = push.movementCategories.map((r) => r.syncId);
        const existingRecords = await tx.movementCategory.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, MovementCategory>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.movementCategories) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify MovementCategory ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.movementCategory.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 12. FeeTransaction
      if (push.feeTransactions && push.feeTransactions.length > 0) {
        const syncIds = push.feeTransactions.map((r) => r.syncId);
        const existingRecords = await tx.feeTransaction.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, FeeTransaction>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.feeTransactions) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify FeeTransaction ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.feeTransaction.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 13. Transaction
      if (push.transactions && push.transactions.length > 0) {
        const syncIds = push.transactions.map((r) => r.syncId);
        const existingRecords = await tx.transaction.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, Transaction>(
          existingRecords.map((x) => [x.syncId!, x]),
        );

        for (const r of push.transactions) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify Transaction ${r.syncId} owned by User ${existing.userId}`,
              );
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
            ocrStatus: r.ocrStatus ?? OcrStatus.PENDING,
            ocrExtractedAmount: r.ocrExtractedAmount ?? null,
            ocrRawText: r.ocrRawText ?? null,
            ocrProcessedAt: r.ocrProcessedAt ? new Date(r.ocrProcessedAt) : null,
            externalProvider: r.externalProvider ?? null,
            externalTransactionId: r.externalTransactionId ?? null,
            note: r.note ?? '',
            reference: r.reference ?? '',
            entryDate: r.entryDate ?? r.updatedAt ?? new Date().toISOString(),
            status: r.status ?? TransactionStatus.COMPLETED,
          };
          if (existing) {
            await tx.transaction.update({ where: { id: existing.id }, data });
          } else {
            await tx.transaction.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 14. LedgerEntry
      if (push.ledgerEntries && push.ledgerEntries.length > 0) {
        const syncIds = push.ledgerEntries.map((r) => r.syncId);
        const existingRecords = await tx.ledgerEntry.findMany({
          where: { syncId: { in: syncIds } },
        });
        const existingMap = new Map<string, LedgerEntry>(
          existingRecords.map((x) => [x.syncId, x]),
        );

        for (const r of push.ledgerEntries) {
          const existing = existingMap.get(r.syncId);
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing) {
            if (existing.userId !== userId) {
              this.logger.warn(
                `Security Warning: User ${userId} attempted to modify LedgerEntry ${r.syncId} owned by User ${existing.userId}`,
              );
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
          } else {
            await tx.ledgerEntry.create({
              data: { ...(validUuid(r.id) ? { id: validUuid(r.id)! } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }
    });

    this.logger.log(
      `Push complete for device: ${deviceId}, user: ${userId}`,
    );

    // ── Pull — return all changes the calling device is missing (capped at 500 records per model) ──────────────
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

      // Map saleItems to items to preserve Flutter remote contract
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
      };
    });

    return {
      success: true,
      timestamp: serverTimestamp,
      pull: pullData,
    };
  }
}
