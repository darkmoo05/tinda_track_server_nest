import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ChargeModule } from './modules/charge/charge.module';
import { PartyModule } from './modules/party/party.module';
import { TransactionTypeModule } from './modules/transaction-type/transaction-type.module';
import { MovementCategoryModule } from './modules/movement-category/movement-category.module';
import { LedgerEntryModule } from './modules/ledger-entry/ledger-entry.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PosModule } from './modules/pos/pos.module';
import { FeeTransactionModule } from './modules/fee-transaction/fee-transaction.module';

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

