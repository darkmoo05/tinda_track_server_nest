import { TransactionTypeService } from './transaction-type.service.js';
import { TransactionTypeItemDto } from './dto/transaction-type-item.dto.js';
import { PullTransactionTypesQueryDto } from './dto/pull-transaction-types-query.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class TransactionTypeController {
    private readonly transactionTypeService;
    constructor(transactionTypeService: TransactionTypeService);
    push(user: AuthUser, body: TransactionTypeItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullTransactionTypesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
