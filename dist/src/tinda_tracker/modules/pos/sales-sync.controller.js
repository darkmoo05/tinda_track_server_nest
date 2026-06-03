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
exports.SalesSyncController = void 0;
const common_1 = require("@nestjs/common");
const pos_service_js_1 = require("./pos.service.js");
const push_sales_dto_js_1 = require("./dto/push-sales.dto.js");
const current_user_decorator_js_1 = require("../../../modules/auth/decorators/current-user.decorator.js");
let SalesSyncController = class SalesSyncController {
    posService;
    constructor(posService) {
        this.posService = posService;
    }
    async push(user, body) {
        const synced = await this.posService.pushSales(user.id, body);
        return { success: true, synced };
    }
    async pull(user, query) {
        const data = await this.posService.pullSales(user.id, query);
        return { success: true, data };
    }
};
exports.SalesSyncController = SalesSyncController;
__decorate([
    (0, common_1.Post)('push'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], SalesSyncController.prototype, "push", null);
__decorate([
    (0, common_1.Get)('pull'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, push_sales_dto_js_1.PullSalesQueryDto]),
    __metadata("design:returntype", Promise)
], SalesSyncController.prototype, "pull", null);
exports.SalesSyncController = SalesSyncController = __decorate([
    (0, common_1.Controller)('sales'),
    __metadata("design:paramtypes", [pos_service_js_1.PosService])
], SalesSyncController);
//# sourceMappingURL=sales-sync.controller.js.map