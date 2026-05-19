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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const [totals, recentEntries] = await Promise.all([
            this.prisma.ledgerEntry.aggregate({
                where: { isDeleted: false },
                _sum: {
                    walletDelta: true,
                    mayaWalletDelta: true,
                    onHandDelta: true,
                    recordedFlow: true,
                },
            }),
            this.prisma.ledgerEntry.findMany({
                where: { isDeleted: false },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
        ]);
        return {
            gcashBalance: totals._sum.walletDelta ?? 0,
            mayaBalance: totals._sum.mayaWalletDelta ?? 0,
            onHandBalance: totals._sum.onHandDelta ?? 0,
            totalRecordedFlow: totals._sum.recordedFlow ?? 0,
            recentEntries,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map