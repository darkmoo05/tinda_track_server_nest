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
exports.ChargeController = void 0;
const common_1 = require("@nestjs/common");
const charge_service_js_1 = require("./charge.service.js");
const push_charges_dto_js_1 = require("./dto/push-charges.dto.js");
const pull_charges_query_dto_js_1 = require("./dto/pull-charges-query.dto.js");
const public_decorator_js_1 = require("../../../modules/auth/decorators/public.decorator.js");
let ChargeController = class ChargeController {
    chargeService;
    constructor(chargeService) {
        this.chargeService = chargeService;
    }
    async push(body) {
        const synced = await this.chargeService.push(body);
        return { success: true, synced };
    }
    async pull(query) {
        const data = await this.chargeService.pull(query);
        return { success: true, data };
    }
};
exports.ChargeController = ChargeController;
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Post)('push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: push_charges_dto_js_1.ChargeItemDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ChargeController.prototype, "push", null);
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pull_charges_query_dto_js_1.PullChargesQueryDto]),
    __metadata("design:returntype", Promise)
], ChargeController.prototype, "pull", null);
exports.ChargeController = ChargeController = __decorate([
    (0, common_1.Controller)('charges'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [charge_service_js_1.ChargeService])
], ChargeController);
//# sourceMappingURL=charge.controller.js.map