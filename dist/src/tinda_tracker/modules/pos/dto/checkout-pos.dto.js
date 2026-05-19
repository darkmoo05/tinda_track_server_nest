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
exports.CheckoutPosItemDto = exports.CheckoutPosDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CheckoutPosItemDto {
    productId;
    quantity;
}
exports.CheckoutPosItemDto = CheckoutPosItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CheckoutPosItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CheckoutPosItemDto.prototype, "quantity", void 0);
class CheckoutPosDto {
    items;
    paidAmount;
    note;
    reference;
    deviceId;
}
exports.CheckoutPosDto = CheckoutPosDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CheckoutPosItemDto),
    __metadata("design:type", Array)
], CheckoutPosDto.prototype, "items", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CheckoutPosDto.prototype, "paidAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckoutPosDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckoutPosDto.prototype, "reference", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckoutPosDto.prototype, "deviceId", void 0);
//# sourceMappingURL=checkout-pos.dto.js.map