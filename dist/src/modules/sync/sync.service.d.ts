import { PrismaService } from '../../prisma/prisma.service.js';
import { SyncPushDto } from './dto/sync.dto.js';
export declare class SyncService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    pushAndPull(deviceId: string, lastSync: number | undefined, push: SyncPushDto): Promise<{
        success: boolean;
        timestamp: number;
        pull: {
            productCategories: any;
            shelfLocations: any;
            products: any;
            productUnitConversions: any;
            customers: any;
            utangRecords: any;
            sales: any;
            charges: any;
            parties: any;
            transactionTypes: any;
            movementCategories: any;
            feeTransactions: any;
            transactions: any;
            ledgerEntries: any;
        };
    }>;
}
