import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService wraps the Prisma 7 client using composition.
 *
 * Configures soft-delete query filters, database lifecycle management,
 * and slow-query warning instrumentation.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly _client: PrismaClient;
  private readonly _extendedClient: any;
  private readonly _pool: Pool;

  constructor(private readonly config: ConfigService) {
    const self = this;
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    const max = config.get<number>('POSTGRES_MAX_CONNECTIONS') ?? 20;
    const idleTimeoutMillis = config.get<number>('POSTGRES_IDLE_TIMEOUT') ?? 30000;

    this._pool = new Pool({
      connectionString,
      max,
      idleTimeoutMillis,
    });
    const adapter = new PrismaPg(this._pool);
    this._client = new PrismaClient({ adapter } as any);

    const SOFT_DELETE_MODELS = new Set([
      'Charge',
      'Party',
      'TransactionType',
      'MovementCategory',
      'FeeTransaction',
      'LedgerEntry',
      'ProductCategory',
      'ShelfLocation',
      'Product',
      'Sale',
      'Customer',
      'UtangRecord',
    ]);

    // Extend Prisma Client to automate soft-delete operations and query execution logging
    this._extendedClient = this._client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const isSoftDeleteModel = model && SOFT_DELETE_MODELS.has(model);

            // 1. Automatically filter out soft-deleted records on queries
            if (
              isSoftDeleteModel &&
              (operation === 'findMany' ||
                operation === 'findFirst' ||
                operation === 'findUnique' ||
                operation === 'count')
            ) {
              args.where = args.where || {};
              const where = args.where as any;
              if (where.isDeleted === undefined) {
                where.isDeleted = false;
              }
            }

            // 2. Intercept hard delete and convert to soft delete
            if (isSoftDeleteModel && operation === 'delete') {
              return (self as any)._extendedClient[model].update({
                where: args.where,
                data: { isDeleted: true },
              });
            }

            if (isSoftDeleteModel && operation === 'deleteMany') {
              return (self as any)._extendedClient[model].updateMany({
                where: args.where,
                data: { isDeleted: true },
              });
            }

            // 3. Request performance monitoring wrapper
            const start = Date.now();
            try {
              return await query(args);
            } finally {
              const duration = Date.now() - start;
              if (duration > 150) {
                Logger.warn(
                  `Slow query detected: ${model}.${operation} took ${duration}ms`,
                  'PrismaService',
                );
              }
            }
          },
        },
      },
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  async onModuleInit(): Promise<void> {
    await this._client.$connect();
    this.logger.log('Prisma connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this._client.$disconnect();
    await this._pool.end();
    this.logger.log('Prisma disconnected');
  }

  // ── Model delegates ───────────────────────────────────────────────────────
  // Exposed via the extended client so soft-deletes and query logging are applied.

  get charge() {
    return this._extendedClient.charge;
  }

  get party() {
    return this._extendedClient.party;
  }

  get transactionType() {
    return this._extendedClient.transactionType;
  }

  get movementCategory() {
    return this._extendedClient.movementCategory;
  }

  get ledgerEntry() {
    return this._extendedClient.ledgerEntry;
  }

  get transaction() {
    return this._extendedClient.transaction;
  }

  get product() {
    return this._extendedClient.product;
  }

  get productCategory() {
    return this._extendedClient.productCategory;
  }

  get productUnitConversion() {
    return this._extendedClient.productUnitConversion;
  }

  get shelfLocation() {
    return this._extendedClient.shelfLocation;
  }

  get stockMovement() {
    return this._extendedClient.stockMovement;
  }

  get sale() {
    return this._extendedClient.sale;
  }

  get saleItem() {
    return this._extendedClient.saleItem;
  }

  get feeTransaction() {
    return this._extendedClient.feeTransaction;
  }

  get customer() {
    return this._extendedClient.customer;
  }

  get utangRecord() {
    return this._extendedClient.utangRecord;
  }

  get user() {
    return this._extendedClient.user;
  }

  get refreshToken() {
    return this._extendedClient.refreshToken;
  }

  async $transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    return this._extendedClient.$transaction(callback as never) as Promise<T>;
  }
}
