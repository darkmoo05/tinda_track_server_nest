import { SyncService } from './sync.service.js';
import { SyncRequestDto } from './dto/sync.dto.js';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    sync(req: {
        user: {
            id: string;
        };
    }, body: SyncRequestDto): Promise<{
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
