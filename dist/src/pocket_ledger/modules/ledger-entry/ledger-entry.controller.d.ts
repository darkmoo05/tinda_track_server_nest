import { LedgerEntryService } from './ledger-entry.service.js';
import { LedgerEntryItemDto } from './dto/ledger-entry-item.dto.js';
import { PullLedgerEntriesQueryDto } from './dto/pull-ledger-entries-query.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class LedgerEntryController {
    private readonly ledgerEntryService;
    constructor(ledgerEntryService: LedgerEntryService);
    push(user: AuthUser, body: LedgerEntryItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullLedgerEntriesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
