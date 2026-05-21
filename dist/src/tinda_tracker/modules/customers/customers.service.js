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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../../../prisma/prisma.service.js");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const customers = await this.prisma.customer.findMany({
            where: { isDeleted: false },
            include: { utangRecords: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } } },
            orderBy: { name: 'asc' },
        });
        return customers
            .map((c) => ({
            ...c,
            balance: c.utangRecords.reduce((sum, r) => sum + r.amount, 0),
        }))
            .sort((a, b) => b.balance - a.balance);
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { utangRecords: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } } },
        });
        if (!customer || customer.isDeleted) {
            throw new common_1.NotFoundException('Customer not found');
        }
        return {
            ...customer,
            balance: customer.utangRecords.reduce((sum, r) => sum + r.amount, 0),
        };
    }
    async create(dto) {
        return this.prisma.customer.create({
            data: {
                name: dto.name,
                phone: dto.phone ?? '',
                address: dto.address ?? '',
                notes: dto.notes ?? '',
            },
        });
    }
    async addUtang(customerId, dto) {
        await this.ensureCustomerExists(customerId);
        return this.prisma.utangRecord.create({
            data: {
                customerId,
                description: dto.description,
                amount: Math.abs(dto.amount),
            },
        });
    }
    async recordPayment(customerId, dto) {
        await this.ensureCustomerExists(customerId);
        return this.prisma.utangRecord.create({
            data: {
                customerId,
                description: dto.note ?? 'Payment received',
                amount: -Math.abs(dto.amount),
            },
        });
    }
    async remove(id) {
        await this.ensureCustomerExists(id);
        return this.prisma.customer.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    async ensureCustomerExists(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer || customer.isDeleted) {
            throw new common_1.NotFoundException('Customer not found');
        }
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map