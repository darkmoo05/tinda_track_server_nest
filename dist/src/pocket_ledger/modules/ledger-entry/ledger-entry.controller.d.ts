import { LedgerEntryService } from './ledger-entry.service';
import { LedgerEntryItemDto } from './dto/ledger-entry-item.dto.js';
import { PullLedgerEntriesQueryDto } from './dto/pull-ledger-entries-query.dto.js';
export declare class LedgerEntryController {
    private readonly ledgerEntryService;
    constructor(ledgerEntryService: LedgerEntryService);
    push(body: LedgerEntryItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullLedgerEntriesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
