import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import Joi from 'joi';
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
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(8080),
        THROTTLER_TTL: Joi.number().default(60000),
        THROTTLER_LIMIT: Joi.number().default(100),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      },
    }),
    PrismaModule,

    // API Rate-limiting: Max 100 requests per 60 seconds (dynamic config)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLER_TTL') ?? 60000,
          limit: config.get<number>('THROTTLER_LIMIT') ?? 100,
        },
      ],
    }),

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


