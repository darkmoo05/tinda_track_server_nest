import type { LedgerEntry } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LedgerEntryItemDto } from './dto/ledger-entry-item.dto.js';
import { PullLedgerEntriesQueryDto } from './dto/pull-ledger-entries-query.dto.js';
export declare class LedgerEntryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(records: LedgerEntryItemDto[]): Promise<number>;
    pull(query: PullLedgerEntriesQueryDto): Promise<LedgerEntry[]>;
}
