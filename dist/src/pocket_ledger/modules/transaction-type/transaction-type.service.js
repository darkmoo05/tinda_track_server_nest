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
var TransactionTypeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionTypeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
let TransactionTypeService = TransactionTypeService_1 = class TransactionTypeService {
    prisma;
    logger = new common_1.Logger(TransactionTypeService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async push(userId, records) {
        await Promise.all(records.map((record) => this.prisma.transactionType.upsert({
            where: { syncId: record.syncId },
            create: {
                userId,
                syncId: record.syncId,
                deviceId: record.deviceId,
                name: record.name,
                isOutflow: record.isOutflow ?? false,
                walletAccount: record.walletAccount ?? 'GCash',
                isDeleted: record.isDeleted ?? false,
            },
            update: {
                userId,
                deviceId: record.deviceId,
                name: record.name,
                isOutflow: record.isOutflow ?? false,
                walletAccount: record.walletAccount ?? 'GCash',
                isDeleted: record.isDeleted ?? false,
            },
        })));
        this.logger.log(`Pushed ${records.length} transaction type record(s)`);
        return records.length;
    }
    async pull(userId, query) {
        const { since, deviceId } = query;
        const sinceMs = Number(since ?? '0');
        const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;
        return this.prisma.transactionType.findMany({
            where: isIncrementalSync
                ? {
                    userId,
                    updatedAt: { gt: new Date(sinceMs) },
                    ...(deviceId ? { deviceId: { not: deviceId } } : {}),
                }
                : { userId, isDeleted: false },
            orderBy: isIncrementalSync ? { updatedAt: 'asc' } : { createdAt: 'asc' },
        });
    }
};
exports.TransactionTypeService = TransactionTypeService;
exports.TransactionTypeService = TransactionTypeService = TransactionTypeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], TransactionTypeService);
//# sourceMappingURL=transaction-type.service.js.map