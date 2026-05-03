import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly _client;
    private readonly _pool;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get charge(): import("@prisma/client").Prisma.ChargeDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get party(): import("@prisma/client").Prisma.PartyDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get transactionType(): import("@prisma/client").Prisma.TransactionTypeDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get movementCategory(): import("@prisma/client").Prisma.MovementCategoryDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get ledgerEntry(): import("@prisma/client").Prisma.LedgerEntryDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get transaction(): import("@prisma/client").Prisma.TransactionDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get product(): import("@prisma/client").Prisma.ProductDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get stockMovement(): import("@prisma/client").Prisma.StockMovementDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get sale(): import("@prisma/client").Prisma.SaleDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get saleItem(): import("@prisma/client").Prisma.SaleItemDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    $transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
}
