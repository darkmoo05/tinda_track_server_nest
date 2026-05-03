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
var PartyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
let PartyService = PartyService_1 = class PartyService {
    prisma;
    logger = new common_1.Logger(PartyService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async push(records) {
        await Promise.all(records.map((record) => this.prisma.party.upsert({
            where: { syncId: record.syncId },
            create: {
                syncId: record.syncId,
                deviceId: record.deviceId,
                name: record.name,
                accountNumber: record.accountNumber,
                entityId: record.entityId ?? '',
                description: record.description ?? '',
                joinDate: record.joinDate,
                isVerified: record.isVerified ?? false,
                isDeleted: record.isDeleted ?? false,
            },
            update: {
                deviceId: record.deviceId,
                name: record.name,
                accountNumber: record.accountNumber,
                entityId: record.entityId ?? '',
                description: record.description ?? '',
                joinDate: record.joinDate,
                isVerified: record.isVerified ?? false,
                isDeleted: record.isDeleted ?? false,
            },
        })));
        this.logger.log(`Pushed ${records.length} party record(s)`);
        return records.length;
    }
    async pull(query) {
        const { since, deviceId } = query;
        const sinceMs = Number(since ?? '0');
        const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;
        return this.prisma.party.findMany({
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
exports.PartyService = PartyService;
exports.PartyService = PartyService = PartyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], PartyService);
//# sourceMappingURL=party.service.js.map