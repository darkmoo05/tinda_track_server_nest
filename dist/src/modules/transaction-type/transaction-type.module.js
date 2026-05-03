"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionTypeModule = void 0;
const common_1 = require("@nestjs/common");
const transaction_type_controller_1 = require("./transaction-type.controller");
const transaction_type_service_1 = require("./transaction-type.service");
let TransactionTypeModule = class TransactionTypeModule {
};
exports.TransactionTypeModule = TransactionTypeModule;
exports.TransactionTypeModule = TransactionTypeModule = __decorate([
    (0, common_1.Module)({
        controllers: [transaction_type_controller_1.TransactionTypeController],
        providers: [transaction_type_service_1.TransactionTypeService],
        exports: [transaction_type_service_1.TransactionTypeService],
    })
], TransactionTypeModule);
//# sourceMappingURL=transaction-type.module.js.map