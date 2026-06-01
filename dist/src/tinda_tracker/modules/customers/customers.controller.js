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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_js_1 = require("./customers.service.js");
const create_customer_dto_js_1 = require("./dto/create-customer.dto.js");
const utang_dto_js_1 = require("./dto/utang.dto.js");
const sync_dto_js_1 = require("./dto/sync.dto.js");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async list() {
        const data = await this.customersService.list();
        return { success: true, data };
    }
    async push(body) {
        const synced = await this.customersService.pushCustomers(body);
        return { success: true, synced };
    }
    async pull(query) {
        const data = await this.customersService.pullCustomers(query);
        return { success: true, data };
    }
    async findOne(id) {
        const data = await this.customersService.findOne(id);
        return { success: true, data };
    }
    async create(body) {
        const data = await this.customersService.create(body);
        return { success: true, data };
    }
    async addUtang(id, body) {
        const data = await this.customersService.addUtang(id, body);
        return { success: true, data };
    }
    async recordPayment(id, body) {
        const data = await this.customersService.recordPayment(id, body);
        return { success: true, data };
    }
    async remove(id) {
        const data = await this.customersService.remove(id);
        return { success: true, data };
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('push'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "push", null);
__decorate([
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_dto_js_1.PullCustomersQueryDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "pull", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_js_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/utang'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, utang_dto_js_1.AddUtangDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "addUtang", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, utang_dto_js_1.RecordPaymentDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "remove", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_js_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map