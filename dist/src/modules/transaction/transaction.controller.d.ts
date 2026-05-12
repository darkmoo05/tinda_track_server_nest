import { CreateManualTransactionDto, CreateTransactionDto } from './dto/create-transaction.dto.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { TransactionPreviewQueryDto, TransactionPreviewResponseDto } from './dto/transaction-preview.dto.js';
import { TransactionService } from './transaction.service.js';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    list(query: ListTransactionsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    preview(query: TransactionPreviewQueryDto): Promise<{
        success: boolean;
        data: TransactionPreviewResponseDto;
    }>;
    createManual(body: CreateManualTransactionDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    createFromReceipt(receipt: Express.Multer.File, body: CreateTransactionDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
