import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService wraps the Prisma 7 client using composition.
 *
 * Prisma 7 requires connection info to be passed via a database adapter at
 * instantiation time rather than in the schema file. We use @prisma/adapter-pg
 * so a standard DATABASE_URL string still drives the connection.
 *
 * Model delegates (e.g. `charge`) are exposed as getters so callers can write
 *   this.prisma.charge.findMany(...)
 * just as they would if PrismaService extended PrismaClient directly.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly _client: PrismaClient;
  private readonly _pool: Pool;

  constructor(private readonly config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');
    this._pool = new Pool({ connectionString });
    const adapter = new PrismaPg(this._pool);
    // PrismaClient in v7 is a factory-produced class; adapter is required.
    this._client = new PrismaClient({ adapter } as any);
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
  // Add a getter for every Prisma model that a feature module needs.
  // This keeps injection ergonomics identical to the classic extend pattern.

  get charge() {
    return this._client.charge;
  }

  get party() {
    return this._client.party;
  }

  get transactionType() {
    return this._client.transactionType;
  }

  get movementCategory() {
    return this._client.movementCategory;
  }

  get ledgerEntry() {
    return this._client.ledgerEntry;
  }

  get transaction() {
    return this._client.transaction;
  }

  get product() {
    return this._client.product;
  }

  get productCategory() {
    return this._client.productCategory;
  }

  get productUnitConversion() {
    return this._client.productUnitConversion;
  }

  get shelfLocation() {
    return this._client.shelfLocation;
  }

  get stockMovement() {
    return this._client.stockMovement;
  }

  get sale() {
    return this._client.sale;
  }

  get saleItem() {
    return this._client.saleItem;
  }

  get feeTransaction() {
    return this._client.feeTransaction;
  }

  get customer() {
    return this._client.customer;
  }

  get utangRecord() {
    return this._client.utangRecord;
  }

  async $transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    return this._client.$transaction(callback as never) as Promise<T>;
  }
}

