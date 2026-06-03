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
exports.PosController = void 0;
const common_1 = require("@nestjs/common");
const checkout_pos_dto_js_1 = require("./dto/checkout-pos.dto.js");
const list_sales_query_dto_js_1 = require("./dto/list-sales-query.dto.js");
const pos_service_js_1 = require("./pos.service.js");
const current_user_decorator_js_1 = require("../../../modules/auth/decorators/current-user.decorator.js");
let PosController = class PosController {
    posService;
    constructor(posService) {
        this.posService = posService;
    }
    async checkout(user, body) {
        const data = await this.posService.checkout(user.id, body);
        return { success: true, data };
    }
    async listSales(user, query) {
        const data = await this.posService.listSales(user.id, query);
        return { success: true, data };
    }
    async getDashboard(user) {
        const data = await this.posService.getDashboardStats(user.id);
        return { success: true, data };
    }
    async getReports(user, query) {
        const data = await this.posService.getReports(user.id, query);
        return { success: true, data };
    }
};
exports.PosController = PosController;
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, checkout_pos_dto_js_1.CheckoutPosDto]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "checkout", null);
__decorate([
    (0, common_1.Get)('sales'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_sales_query_dto_js_1.ListSalesQueryDto]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "listSales", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_sales_query_dto_js_1.ListSalesQueryDto]),
    __metadata("design:returntype", Promise)
], PosController.prototype, "getReports", null);
exports.PosController = PosController = __decorate([
    (0, common_1.Controller)('pos'),
    __metadata("design:paramtypes", [pos_service_js_1.PosService])
], PosController);
//# sourceMappingURL=pos.controller.js.map