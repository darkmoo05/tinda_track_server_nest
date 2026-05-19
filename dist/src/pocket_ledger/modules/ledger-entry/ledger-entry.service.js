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
var LedgerEntryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEntryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
let LedgerEntryService = LedgerEntryService_1 = class LedgerEntryService {
    prisma;
    logger = new common_1.Logger(LedgerEntryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async push(records) {
        await Promise.all(records.map((record) => this.prisma.ledgerEntry.upsert({
            where: { syncId: record.syncId },
            create: {
                syncId: record.syncId,
                deviceId: record.deviceId,
                entryType: record.entryType,
                title: record.title ?? '',
                note: record.note ?? '',
                reference: record.reference ?? '',
                amount: record.amount,
                walletDelta: record.walletDelta ?? 0,
                mayaWalletDelta: record.mayaWalletDelta ?? 0,
                onHandDelta: record.onHandDelta ?? 0,
                recordedFlow: record.recordedFlow ?? 0,
                tag: record.tag ?? '',
                iconKey: record.iconKey ?? '',
                walletAccount: record.walletAccount ?? '',
                ownerScope: record.ownerScope ?? 'Business',
                ownerMovementType: record.ownerMovementType ?? null,
                ownerCategory: record.ownerCategory ?? null,
                ownerPartyName: record.ownerPartyName ?? null,
                ownerPartyAccount: record.ownerPartyAccount ?? null,
                entryDate: record.entryDate,
                isDeleted: record.isDeleted ?? false,
            },
            update: {
                deviceId: record.deviceId,
                entryType: record.entryType,
                title: record.title ?? '',
                note: record.note ?? '',
                reference: record.reference ?? '',
                amount: record.amount,
                walletDelta: record.walletDelta ?? 0,
                mayaWalletDelta: record.mayaWalletDelta ?? 0,
                onHandDelta: record.onHandDelta ?? 0,
                recordedFlow: record.recordedFlow ?? 0,
                tag: record.tag ?? '',
                iconKey: record.iconKey ?? '',
                walletAccount: record.walletAccount ?? '',
                ownerScope: record.ownerScope ?? 'Business',
                ownerMovementType: record.ownerMovementType ?? null,
                ownerCategory: record.ownerCategory ?? null,
                ownerPartyName: record.ownerPartyName ?? null,
                ownerPartyAccount: record.ownerPartyAccount ?? null,
                entryDate: record.entryDate,
                isDeleted: record.isDeleted ?? false,
            },
        })));
        this.logger.log(`Pushed ${records.length} ledger entry record(s)`);
        return records.length;
    }
    async pull(query) {
        const { since, deviceId } = query;
        const sinceMs = Number(since ?? '0');
        const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;
        return this.prisma.ledgerEntry.findMany({
            where: isIncrementalSync
                ? {
                    updatedAt: { gt: new Date(sinceMs) },
                    ...(deviceId ? { deviceId: { not: deviceId } } : {}),
                }
                : { isDeleted: false },
            orderBy: isIncrementalSync ? { updatedAt: 'asc' } : { createdAt: 'asc' },
        });
    }
};
exports.LedgerEntryService = LedgerEntryService;
exports.LedgerEntryService = LedgerEntryService = LedgerEntryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], LedgerEntryService);
//# sourceMappingURL=ledger-entry.service.js.map