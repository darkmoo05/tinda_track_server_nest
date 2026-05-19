import type { Transaction } from '@prisma/client';
import { TransactionDirection, WalletProvider } from '@prisma/client';
import { ChargeService } from '../charge/charge.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { ReceiptOcrService } from './receipt-ocr.service.js';
export declare class TransactionService {
    private readonly prisma;
    private readonly chargeService;
    private readonly receiptOcrService;
    constructor(prisma: PrismaService, chargeService: ChargeService, receiptOcrService: ReceiptOcrService);
    create(dto: CreateTransactionDto, receiptFile?: Express.Multer.File): Promise<Transaction>;
    list(query: ListTransactionsQueryDto): Promise<Transaction[]>;
    preview(walletProvider: WalletProvider, direction: TransactionDirection, amount: number, chargeHandling?: 'addOnTop' | 'deductFromAmount', transactionTypeKey?: string): Promise<{
        chargeAmount: number;
        totalCollected: number;
        walletCredit: number;
        onHandChange: number;
        feeRoutingExplanation: string;
        currentWalletBalance: number;
        postTransactionWalletBalance: number;
    }>;
    private buildTransactionTypeKey;
    private getWalletBalance;
    private buildMovement;
    private buildReference;
}
