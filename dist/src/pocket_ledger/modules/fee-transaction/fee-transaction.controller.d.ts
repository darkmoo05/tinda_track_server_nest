import { FeeTransactionService } from './fee-transaction.service.js';
import { FeeTransactionItemDto } from './dto/fee-transaction-item.dto.js';
import { PullFeeTransactionsQueryDto } from './dto/pull-fee-transactions-query.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class FeeTransactionController {
    private readonly feeTransactionService;
    constructor(feeTransactionService: FeeTransactionService);
    push(user: AuthUser, body: FeeTransactionItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullFeeTransactionsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
