"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService {
    config;
    logger = new common_1.Logger(PrismaService_1.name);
    _client;
    _extendedClient;
    _pool;
    constructor(config) {
        this.config = config;
        const connectionString = config.getOrThrow('DATABASE_URL');
        this._pool = new pg_1.Pool({ connectionString });
        const adapter = new adapter_pg_1.PrismaPg(this._pool);
        this._client = new client_1.PrismaClient({ adapter });
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
        this._extendedClient = this._client.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const isSoftDeleteModel = model && SOFT_DELETE_MODELS.has(model);
                        if (isSoftDeleteModel &&
                            (operation === 'findMany' ||
                                operation === 'findFirst' ||
                                operation === 'findUnique' ||
                                operation === 'count')) {
                            args.where = args.where || {};
                            const where = args.where;
                            if (where.isDeleted === undefined) {
                                where.isDeleted = false;
                            }
                        }
                        if (isSoftDeleteModel && operation === 'delete') {
                            return query({
                                ...args,
                                operation: 'update',
                                args: {
                                    ...args,
                                    data: { isDeleted: true },
                                },
                            });
                        }
                        if (isSoftDeleteModel && operation === 'deleteMany') {
                            return query({
                                ...args,
                                operation: 'updateMany',
                                args: {
                                    ...args,
                                    data: { isDeleted: true },
                                },
                            });
                        }
                        const start = Date.now();
                        try {
                            return await query(args);
                        }
                        finally {
                            const duration = Date.now() - start;
                            if (duration > 150) {
                                common_1.Logger.warn(`Slow query detected: ${model}.${operation} took ${duration}ms`, 'PrismaService');
                            }
                        }
                    },
                },
            },
        });
    }
    async onModuleInit() {
        await this._client.$connect();
        this.logger.log('Prisma connected to PostgreSQL');
    }
    async onModuleDestroy() {
        await this._client.$disconnect();
        await this._pool.end();
        this.logger.log('Prisma disconnected');
    }
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
    async $transaction(callback) {
        return this._extendedClient.$transaction(callback);
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map