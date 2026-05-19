import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
// ── PocketLedger modules ──────────────────────────────────────────────────
import { ChargeModule } from './pocket_ledger/modules/charge/charge.module';
import { PartyModule } from './pocket_ledger/modules/party/party.module';
import { TransactionTypeModule } from './pocket_ledger/modules/transaction-type/transaction-type.module';
import { MovementCategoryModule } from './pocket_ledger/modules/movement-category/movement-category.module';
import { LedgerEntryModule } from './pocket_ledger/modules/ledger-entry/ledger-entry.module';
import { DashboardModule } from './pocket_ledger/modules/dashboard/dashboard.module';
import { TransactionModule } from './pocket_ledger/modules/transaction/transaction.module';
import { FeeTransactionModule } from './pocket_ledger/modules/fee-transaction/fee-transaction.module';
// ── TindaTracker modules ──────────────────────────────────────────────────
import { InventoryModule } from './tinda_tracker/modules/inventory/inventory.module';
import { PosModule } from './tinda_tracker/modules/pos/pos.module';

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
    FeeTransactionModule,
  ],
})
export class AppModule {}

