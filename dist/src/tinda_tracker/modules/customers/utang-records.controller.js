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
exports.UtangRecordsController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_js_1 = require("./customers.service.js");
const sync_dto_js_1 = require("./dto/sync.dto.js");
const public_decorator_js_1 = require("../../../modules/auth/decorators/public.decorator.js");
let UtangRecordsController = class UtangRecordsController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async push(body) {
        const synced = await this.customersService.pushUtangRecords(body);
        return { success: true, synced };
    }
    async pull(query) {
        const data = await this.customersService.pullUtangRecords(query);
        return { success: true, data };
    }
};
exports.UtangRecordsController = UtangRecordsController;
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Post)('push'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UtangRecordsController.prototype, "push", null);
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sync_dto_js_1.PullUtangRecordsQueryDto]),
    __metadata("design:returntype", Promise)
], UtangRecordsController.prototype, "pull", null);
exports.UtangRecordsController = UtangRecordsController = __decorate([
    (0, common_1.Controller)('utang-records'),
    __metadata("design:paramtypes", [customers_service_js_1.CustomersService])
], UtangRecordsController);
//# sourceMappingURL=utang-records.controller.js.map