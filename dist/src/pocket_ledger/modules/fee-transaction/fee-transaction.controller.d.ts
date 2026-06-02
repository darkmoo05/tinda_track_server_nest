import { FeeTransactionService } from './fee-transaction.service.js';
import { FeeTransactionItemDto } from './dto/fee-transaction-item.dto.js';
import { PullFeeTransactionsQueryDto } from './dto/pull-fee-transactions-query.dto.js';
export declare class FeeTransactionController {
    private readonly feeTransactionService;
    constructor(feeTransactionService: FeeTransactionService);
    push(body: FeeTransactionItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullFeeTransactionsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
