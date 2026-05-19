import type { FeeTransaction } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { FeeTransactionItemDto } from './dto/fee-transaction-item.dto.js';
import { PullFeeTransactionsQueryDto } from './dto/pull-fee-transactions-query.dto.js';
export declare class FeeTransactionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(records: FeeTransactionItemDto[]): Promise<number>;
    pull(query: PullFeeTransactionsQueryDto): Promise<FeeTransaction[]>;
}
