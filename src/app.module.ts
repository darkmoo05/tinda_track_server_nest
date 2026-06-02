import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { LoggingMiddleware } from './common/middleware/logging.middleware.js';

// ── PocketLedger modules ──────────────────────────────────────────────────
import { ChargeModule } from './pocket_ledger/modules/charge/charge.module.js';
import { PartyModule } from './pocket_ledger/modules/party/party.module.js';
import { TransactionTypeModule } from './pocket_ledger/modules/transaction-type/transaction-type.module.js';
import { MovementCategoryModule } from './pocket_ledger/modules/movement-category/movement-category.module.js';
import { LedgerEntryModule } from './pocket_ledger/modules/ledger-entry/ledger-entry.module.js';
import { DashboardModule } from './pocket_ledger/modules/dashboard/dashboard.module.js';
import { TransactionModule } from './pocket_ledger/modules/transaction/transaction.module.js';
import { FeeTransactionModule } from './pocket_ledger/modules/fee-transaction/fee-transaction.module.js';

// ── TindaTracker modules ──────────────────────────────────────────────────
import { InventoryModule } from './tinda_tracker/modules/inventory/inventory.module.js';
import { PosModule } from './tinda_tracker/modules/pos/pos.module.js';
import { CustomersModule } from './tinda_tracker/modules/customers/customers.module.js';

// ── Authentication & Sync modules ─────────────────────────────────────────
import { AuthModule } from './modules/auth/auth.module.js';
import { SyncModule } from './modules/sync/sync.module.js';
import { HealthModule } from './modules/health/health.module.js';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './modules/auth/guards/roles.guard.js';

/**
 * Root application module.
 *
 * ConfigModule is marked isGlobal so every feature module can inject
 * ConfigService without re-importing it.
 *
 * PrismaModule is @Global (see prisma.module.ts) so PrismaService is
 * available everywhere without being re-imported per module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,

    // API Rate-limiting: Max 100 requests per 60 seconds
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // ── System & Security Modules ─────────────────────────────────────────
    AuthModule,
    SyncModule,
    HealthModule,

    // ── Feature Modules ───────────────────────────────────────────────────
    ChargeModule,
    PartyModule,
    TransactionTypeModule,
    MovementCategoryModule,
    LedgerEntryModule,
    DashboardModule,
    TransactionModule,
    InventoryModule,
    PosModule,
    CustomersModule,
    FeeTransactionModule,
  ],
  providers: [
    // Register guards globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}


