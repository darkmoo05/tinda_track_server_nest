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
var MonitoringSessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringSessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
let MonitoringSessionService = MonitoringSessionService_1 = class MonitoringSessionService {
    prisma;
    logger = new common_1.Logger(MonitoringSessionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async push(userId, records) {
        await Promise.all(records.map((record) => this.prisma.monitoringSession.upsert({
            where: { syncId: record.syncId },
            create: {
                userId,
                syncId: record.syncId,
                deviceId: record.deviceId,
                name: record.name,
                status: record.status ?? 'ACTIVE',
                startDateMs: BigInt(record.startDateMs),
                endDateMs: record.endDateMs ? BigInt(record.endDateMs) : null,
                startGcash: record.startGcash ?? 0.0,
                startMaya: record.startMaya ?? 0.0,
                startOnHand: record.startOnHand ?? 0.0,
                endGcash: record.endGcash ?? null,
                endMaya: record.endMaya ?? null,
                endOnHand: record.endOnHand ?? null,
                isDeleted: record.isDeleted ?? false,
                updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
            },
            update: {
                userId,
                deviceId: record.deviceId,
                name: record.name,
                status: record.status ?? 'ACTIVE',
                startDateMs: BigInt(record.startDateMs),
                endDateMs: record.endDateMs ? BigInt(record.endDateMs) : null,
                startGcash: record.startGcash ?? 0.0,
                startMaya: record.startMaya ?? 0.0,
                startOnHand: record.startOnHand ?? 0.0,
                endGcash: record.endGcash ?? null,
                endMaya: record.endMaya ?? null,
                endOnHand: record.endOnHand ?? null,
                isDeleted: record.isDeleted ?? false,
                updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
            },
        })));
        this.logger.log(`Pushed ${records.length} monitoring session record(s)`);
        return records.length;
    }
    async pull(userId, query) {
        const { since, deviceId } = query;
        const sinceMs = Number(since ?? '0');
        const isIncrementalSync = Number.isFinite(sinceMs) && sinceMs > 0;
        const sessions = await this.prisma.monitoringSession.findMany({
            where: isIncrementalSync
                ? {
                    userId,
                    updatedAt: { gt: new Date(sinceMs) },
                    ...(deviceId ? { deviceId: { not: deviceId } } : {}),
                }
                : { userId, isDeleted: false },
            orderBy: isIncrementalSync ? { updatedAt: 'asc' } : { createdAt: 'asc' },
        });
        return sessions.map((s) => ({
            id: s.id,
            syncId: s.syncId,
            deviceId: s.deviceId,
            name: s.name,
            status: s.status,
            startDateMs: Number(s.startDateMs),
            endDateMs: s.endDateMs ? Number(s.endDateMs) : null,
            startGcash: s.startGcash,
            startMaya: s.startMaya,
            startOnHand: s.startOnHand,
            endGcash: s.endGcash,
            endMaya: s.endMaya,
            endOnHand: s.endOnHand,
            isDeleted: s.isDeleted,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));
    }
};
exports.MonitoringSessionService = MonitoringSessionService;
exports.MonitoringSessionService = MonitoringSessionService = MonitoringSessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], MonitoringSessionService);
//# sourceMappingURL=monitoring-session.service.js.map