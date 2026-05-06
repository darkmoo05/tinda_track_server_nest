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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const create_transaction_dto_js_1 = require("./dto/create-transaction.dto.js");
const list_transactions_query_dto_js_1 = require("./dto/list-transactions-query.dto.js");
const transaction_preview_dto_js_1 = require("./dto/transaction-preview.dto.js");
const receipt_upload_storage_js_1 = require("./receipt-upload.storage.js");
const transaction_service_js_1 = require("./transaction.service.js");
let TransactionController = class TransactionController {
    transactionService;
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    async list(query) {
        const data = await this.transactionService.list(query);
        return { success: true, data };
    }
    async preview(query) {
        const data = await this.transactionService.preview(query.walletProvider, query.direction, query.amount, query.chargeHandling ?? 'addOnTop');
        return { success: true, data };
    }
    async createManual(body) {
        const data = await this.transactionService.create(body);
        return { success: true, data };
    }
    async createFromReceipt(receipt, body) {
        const data = await this.transactionService.create(body, receipt);
        return { success: true, data };
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_transactions_query_dto_js_1.ListTransactionsQueryDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('preview'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_preview_dto_js_1.TransactionPreviewQueryDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_js_1.CreateManualTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "createManual", null);
__decorate([
    (0, common_1.Post)('receipt'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receipt', {
        storage: receipt_upload_storage_js_1.receiptStorage,
        fileFilter: receipt_upload_storage_js_1.receiptFileFilter,
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i })
        .build({ fileIsRequired: true }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_transaction_dto_js_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "createFromReceipt", null);
exports.TransactionController = TransactionController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transaction_service_js_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map