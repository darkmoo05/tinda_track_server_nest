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
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const logging_middleware_js_1 = require("./common/middleware/logging.middleware.js");
const charge_module_js_1 = require("./pocket_ledger/modules/charge/charge.module.js");
const party_module_js_1 = require("./pocket_ledger/modules/party/party.module.js");
const transaction_type_module_js_1 = require("./pocket_ledger/modules/transaction-type/transaction-type.module.js");
const movement_category_module_js_1 = require("./pocket_ledger/modules/movement-category/movement-category.module.js");
const ledger_entry_module_js_1 = require("./pocket_ledger/modules/ledger-entry/ledger-entry.module.js");
const dashboard_module_js_1 = require("./pocket_ledger/modules/dashboard/dashboard.module.js");
const transaction_module_js_1 = require("./pocket_ledger/modules/transaction/transaction.module.js");
const fee_transaction_module_js_1 = require("./pocket_ledger/modules/fee-transaction/fee-transaction.module.js");
const inventory_module_js_1 = require("./tinda_tracker/modules/inventory/inventory.module.js");
const pos_module_js_1 = require("./tinda_tracker/modules/pos/pos.module.js");
const customers_module_js_1 = require("./tinda_tracker/modules/customers/customers.module.js");
const auth_module_js_1 = require("./modules/auth/auth.module.js");
const sync_module_js_1 = require("./modules/sync/sync.module.js");
const health_module_js_1 = require("./modules/health/health.module.js");
const jwt_auth_guard_js_1 = require("./modules/auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("./modules/auth/guards/roles.guard.js");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logging_middleware_js_1.LoggingMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_js_1.PrismaModule,
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            auth_module_js_1.AuthModule,
            sync_module_js_1.SyncModule,
            health_module_js_1.HealthModule,
            charge_module_js_1.ChargeModule,
            party_module_js_1.PartyModule,
            transaction_type_module_js_1.TransactionTypeModule,
            movement_category_module_js_1.MovementCategoryModule,
            ledger_entry_module_js_1.LedgerEntryModule,
            dashboard_module_js_1.DashboardModule,
            transaction_module_js_1.TransactionModule,
            inventory_module_js_1.InventoryModule,
            pos_module_js_1.PosModule,
            customers_module_js_1.CustomersModule,
            fee_transaction_module_js_1.FeeTransactionModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_js_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_js_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map