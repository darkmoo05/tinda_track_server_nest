"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const charge_module_1 = require("./modules/charge/charge.module");
const party_module_1 = require("./modules/party/party.module");
const transaction_type_module_1 = require("./modules/transaction-type/transaction-type.module");
const movement_category_module_1 = require("./modules/movement-category/movement-category.module");
const ledger_entry_module_1 = require("./modules/ledger-entry/ledger-entry.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const transaction_module_1 = require("./modules/transaction/transaction.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const pos_module_1 = require("./modules/pos/pos.module");
const fee_transaction_module_1 = require("./modules/fee-transaction/fee-transaction.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            charge_module_1.ChargeModule,
            party_module_1.PartyModule,
            transaction_type_module_1.TransactionTypeModule,
            movement_category_module_1.MovementCategoryModule,
            ledger_entry_module_1.LedgerEntryModule,
            dashboard_module_1.DashboardModule,
            transaction_module_1.TransactionModule,
            inventory_module_1.InventoryModule,
            pos_module_1.PosModule,
            fee_transaction_module_1.FeeTransactionModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map