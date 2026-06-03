import { Injectable, Logger } from '@nestjs/common';
import { OcrStatus, TransactionStatus } from '@prisma/client';
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
    // userId is ALWAYS applied — users only ever see their own store's data.
    // hasDeviceId: exclude records the calling device just pushed (echo prevention).
    // hasIsDeleted: on incremental, include soft-deleted so the client can tombstone
    //               them locally; on full sync only pull non-deleted rows.
    const pullWhere = (hasDeviceId: boolean, hasIsDeleted: boolean) => {
      if (isIncremental) {
        return {
          userId,
          updatedAt: { gt: sinceDate },
          ...(hasDeviceId && deviceId ? { deviceId: { not: deviceId } } : {}),
          ...(hasIsDeleted ? { isDeleted: { in: [true, false] } } : {}),
        };
      }
      return {
        userId,
        ...(hasIsDeleted ? { isDeleted: false } : {}),
      };
    };

    // ── Push — upsert every entity sent by the device ────────────────────────
    await this.prisma.$transaction(async (tx) => {
      // Track or update the lastSyncedAt per device
      await tx.deviceSync.upsert({
        where: { deviceId },
        update: { lastSyncedAt: new Date(serverTimestamp) },
        create: { deviceId, lastSyncedAt: new Date(serverTimestamp) },
      });

      // 1. ProductCategory
      if (push.productCategories) {
        for (const r of push.productCategories) {
          // Match by syncId first; fall back to (userId, name) composite unique
          let existing = await tx.productCategory.findUnique({
            where: { syncId: r.syncId },
          });
          if (!existing) {
            existing = await tx.productCategory.findUnique({
              where: { userId_name: { userId, name: r.name } },
            });
          }
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            this.logger.warn(
              `Sync conflict: ProductCategory (syncId: ${r.syncId}) from device ` +
                `${deviceId} rejected — server record is newer.`,
            );
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 2. ShelfLocation
      if (push.shelfLocations) {
        for (const r of push.shelfLocations) {
          let existing = await tx.shelfLocation.findUnique({
            where: { syncId: r.syncId },
          });
          if (!existing) {
            existing = await tx.shelfLocation.findUnique({
              where: { userId_name: { userId, name: r.name } },
            });
          }
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 3. Product
      if (push.products) {
        for (const r of push.products) {
          let existing = await tx.product.findUnique({ where: { syncId: r.syncId } });
          existing ??= await tx.product.findUnique({
            where: {
              userId_sku: {
                userId,
                sku: r.sku,
              },
            },
          });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 4. ProductUnitConversion
      if (push.productUnitConversions) {
        for (const r of push.productUnitConversions) {
          const existing = await tx.productUnitConversion.findUnique({
            where: { syncId: r.syncId },
          });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 5. Customer
      if (push.customers) {
        for (const r of push.customers) {
          const existing = await tx.customer.findUnique({ where: { syncId: r.syncId } });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 6. UtangRecord
      if (push.utangRecords) {
        for (const r of push.utangRecords) {
          const existing = await tx.utangRecord.findUnique({ where: { syncId: r.syncId } });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 7. Sale
      if (push.sales) {
        for (const r of push.sales) {
          const existing = await tx.sale.findUnique({ where: { syncId: r.syncId } });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...saleData },
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
      if (push.charges) {
        for (const r of push.charges) {
          const existing = await tx.charge.findUnique({ where: { syncId: r.syncId } });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 9. Party
      if (push.parties) {
        for (const r of push.parties) {
          const existing = await tx.party.findUnique({ where: { syncId: r.syncId } });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 10. TransactionType
      if (push.transactionTypes) {
        for (const r of push.transactionTypes) {
          const existing = await tx.transactionType.findUnique({
            where: { syncId: r.syncId },
          });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 11. MovementCategory
      if (push.movementCategories) {
        for (const r of push.movementCategories) {
          const existing = await tx.movementCategory.findUnique({
            where: { syncId: r.syncId },
          });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 12. FeeTransaction
      if (push.feeTransactions) {
        for (const r of push.feeTransactions) {
          const existing = await tx.feeTransaction.findUnique({
            where: { syncId: r.syncId },
          });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 13. Transaction
      if (push.transactions) {
        for (const r of push.transactions) {
          const existing = await tx.transaction.findUnique({ where: { syncId: r.syncId } });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
            entryDate: r.entryDate,
            status: r.status ?? TransactionStatus.COMPLETED,
          };
          if (existing) {
            await tx.transaction.update({ where: { id: existing.id }, data });
          } else {
            await tx.transaction.create({
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }

      // 14. LedgerEntry
      if (push.ledgerEntries) {
        for (const r of push.ledgerEntries) {
          const existing = await tx.ledgerEntry.findUnique({ where: { syncId: r.syncId } });
          let incomingUpdatedAt = r.updatedAt ? new Date(r.updatedAt) : new Date();
          if (incomingUpdatedAt.getTime() > Date.now() + 300000) {
            incomingUpdatedAt = new Date();
          }
          if (existing && existing.updatedAt.getTime() > incomingUpdatedAt.getTime()) {
            continue;
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
            entryDate: r.entryDate,
            isDeleted: r.isDeleted ?? false,
          };
          if (existing) {
            await tx.ledgerEntry.update({ where: { id: existing.id }, data });
          } else {
            await tx.ledgerEntry.create({
              data: { ...(r.id ? { id: r.id } : {}), syncId: r.syncId, ...data },
            });
          }
        }
      }
    });

    this.logger.log(
      `Push complete for device: ${deviceId}, user: ${userId}`,
    );

    // ── Pull — return all changes the calling device is missing ──────────────
    const pullData = await this.prisma.$transaction(async (tx) => {
      const productCategories = await tx.productCategory.findMany({
        where: pullWhere(false, true),
        orderBy: { updatedAt: 'asc' },
      });
      const shelfLocations = await tx.shelfLocation.findMany({
        where: pullWhere(false, true),
        orderBy: { updatedAt: 'asc' },
      });
      const products = await tx.product.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const productUnitConversions = await tx.productUnitConversion.findMany({
        where: pullWhere(false, false),
        orderBy: { updatedAt: 'asc' },
      });
      const customers = await tx.customer.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const utangRecords = await tx.utangRecord.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const sales = await tx.sale.findMany({
        where: pullWhere(true, true),
        include: { saleItems: true },
        orderBy: { updatedAt: 'asc' },
      });
      const charges = await tx.charge.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const parties = await tx.party.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const transactionTypes = await tx.transactionType.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const movementCategories = await tx.movementCategory.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const feeTransactions = await tx.feeTransaction.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
      });
      const transactions = await tx.transaction.findMany({
        where: pullWhere(true, false),
        orderBy: { updatedAt: 'asc' },
      });
      const ledgerEntries = await tx.ledgerEntry.findMany({
        where: pullWhere(true, true),
        orderBy: { updatedAt: 'asc' },
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
