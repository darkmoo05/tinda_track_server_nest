import { CreateManualTransactionDto, CreateTransactionDto } from './dto/create-transaction.dto.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { TransactionPreviewQueryDto, TransactionPreviewResponseDto } from './dto/transaction-preview.dto.js';
import { TransactionService } from './transaction.service.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    list(user: AuthUser, query: ListTransactionsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    preview(user: AuthUser, query: TransactionPreviewQueryDto): Promise<{
        success: boolean;
        data: TransactionPreviewResponseDto;
    }>;
    createManual(user: AuthUser, body: CreateManualTransactionDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    createFromReceipt(user: AuthUser, receipt: Express.Multer.File, body: CreateTransactionDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
