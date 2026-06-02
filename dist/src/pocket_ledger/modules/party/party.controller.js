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
exports.PartyController = void 0;
const common_1 = require("@nestjs/common");
const party_service_js_1 = require("./party.service.js");
const party_item_dto_js_1 = require("./dto/party-item.dto.js");
const pull_parties_query_dto_js_1 = require("./dto/pull-parties-query.dto.js");
const public_decorator_js_1 = require("../../../modules/auth/decorators/public.decorator.js");
let PartyController = class PartyController {
    partyService;
    constructor(partyService) {
        this.partyService = partyService;
    }
    async push(body) {
        const synced = await this.partyService.push(body);
        return { success: true, synced };
    }
    async pull(query) {
        const data = await this.partyService.pull(query);
        return { success: true, data };
    }
};
exports.PartyController = PartyController;
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Post)('push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: party_item_dto_js_1.PartyItemDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "push", null);
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pull_parties_query_dto_js_1.PullPartiesQueryDto]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "pull", null);
exports.PartyController = PartyController = __decorate([
    (0, common_1.Controller)('parties'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [party_service_js_1.PartyService])
], PartyController);
//# sourceMappingURL=party.controller.js.map