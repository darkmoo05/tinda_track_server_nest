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
exports.CreateManualTransactionDto = exports.CreateTransactionDto = exports.ChargeHandlingMode = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
var ChargeHandlingMode;
(function (ChargeHandlingMode) {
    ChargeHandlingMode["ADD_ON_TOP"] = "addOnTop";
    ChargeHandlingMode["DEDUCT_FROM_AMOUNT"] = "deductFromAmount";
})(ChargeHandlingMode || (exports.ChargeHandlingMode = ChargeHandlingMode = {}));
class CreateTransactionDto {
    walletProvider;
    direction;
    amount;
    chargeHandling = ChargeHandlingMode.ADD_ON_TOP;
    syncId;
    deviceId;
    reference;
    note;
    entryDate;
    externalProvider;
    externalTransactionId;
    transactionTypeKey;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.WalletProvider),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "walletProvider", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TransactionDirection),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "direction", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ChargeHandlingMode),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "chargeHandling", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "syncId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "reference", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "entryDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "externalProvider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "externalTransactionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transactionTypeKey", void 0);
class CreateManualTransactionDto extends CreateTransactionDto {
}
exports.CreateManualTransactionDto = CreateManualTransactionDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateManualTransactionDto.prototype, "amount", void 0);
//# sourceMappingURL=create-transaction.dto.js.map