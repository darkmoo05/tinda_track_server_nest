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
exports.ListTransactionsQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class ListTransactionsQueryDto {
    walletProvider;
    direction;
    limit = 20;
    status;
}
exports.ListTransactionsQueryDto = ListTransactionsQueryDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.WalletProvider),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListTransactionsQueryDto.prototype, "walletProvider", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TransactionDirection),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListTransactionsQueryDto.prototype, "direction", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ListTransactionsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListTransactionsQueryDto.prototype, "status", void 0);
//# sourceMappingURL=list-transactions-query.dto.js.map