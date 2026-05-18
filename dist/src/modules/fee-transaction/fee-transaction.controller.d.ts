import { FeeTransactionService } from './fee-transaction.service';
import { FeeTransactionItemDto } from './dto/fee-transaction-item.dto';
import { PullFeeTransactionsQueryDto } from './dto/pull-fee-transactions-query.dto';
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
