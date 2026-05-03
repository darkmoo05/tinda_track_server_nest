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
exports.TransactionTypeController = void 0;
const common_1 = require("@nestjs/common");
const transaction_type_service_1 = require("./transaction-type.service");
const transaction_type_item_dto_js_1 = require("./dto/transaction-type-item.dto.js");
const pull_transaction_types_query_dto_js_1 = require("./dto/pull-transaction-types-query.dto.js");
let TransactionTypeController = class TransactionTypeController {
    transactionTypeService;
    constructor(transactionTypeService) {
        this.transactionTypeService = transactionTypeService;
    }
    async push(body) {
        const synced = await this.transactionTypeService.push(body);
        return { success: true, synced };
    }
    async pull(query) {
        const data = await this.transactionTypeService.pull(query);
        return { success: true, data };
    }
};
exports.TransactionTypeController = TransactionTypeController;
__decorate([
    (0, common_1.Post)('push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: transaction_type_item_dto_js_1.TransactionTypeItemDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], TransactionTypeController.prototype, "push", null);
__decorate([
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pull_transaction_types_query_dto_js_1.PullTransactionTypesQueryDto]),
    __metadata("design:returntype", Promise)
], TransactionTypeController.prototype, "pull", null);
exports.TransactionTypeController = TransactionTypeController = __decorate([
    (0, common_1.Controller)('transaction-types'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [transaction_type_service_1.TransactionTypeService])
], TransactionTypeController);
//# sourceMappingURL=transaction-type.controller.js.map