import { TransactionTypeService } from './transaction-type.service';
import { TransactionTypeItemDto } from './dto/transaction-type-item.dto.js';
import { PullTransactionTypesQueryDto } from './dto/pull-transaction-types-query.dto.js';
export declare class TransactionTypeController {
    private readonly transactionTypeService;
    constructor(transactionTypeService: TransactionTypeService);
    push(body: TransactionTypeItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullTransactionTypesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
