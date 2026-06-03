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
exports.LedgerEntryController = void 0;
const common_1 = require("@nestjs/common");
const ledger_entry_service_js_1 = require("./ledger-entry.service.js");
const ledger_entry_item_dto_js_1 = require("./dto/ledger-entry-item.dto.js");
const pull_ledger_entries_query_dto_js_1 = require("./dto/pull-ledger-entries-query.dto.js");
const current_user_decorator_js_1 = require("../../../modules/auth/decorators/current-user.decorator.js");
let LedgerEntryController = class LedgerEntryController {
    ledgerEntryService;
    constructor(ledgerEntryService) {
        this.ledgerEntryService = ledgerEntryService;
    }
    async push(user, body) {
        const synced = await this.ledgerEntryService.push(user.id, body);
        return { success: true, synced };
    }
    async pull(user, query) {
        const data = await this.ledgerEntryService.pull(user.id, query);
        return { success: true, data };
    }
};
exports.LedgerEntryController = LedgerEntryController;
__decorate([
    (0, common_1.Post)('push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: ledger_entry_item_dto_js_1.LedgerEntryItemDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], LedgerEntryController.prototype, "push", null);
__decorate([
    (0, common_1.Get)('pull'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pull_ledger_entries_query_dto_js_1.PullLedgerEntriesQueryDto]),
    __metadata("design:returntype", Promise)
], LedgerEntryController.prototype, "pull", null);
exports.LedgerEntryController = LedgerEntryController = __decorate([
    (0, common_1.Controller)('entries'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [ledger_entry_service_js_1.LedgerEntryService])
], LedgerEntryController);
//# sourceMappingURL=ledger-entry.controller.js.map