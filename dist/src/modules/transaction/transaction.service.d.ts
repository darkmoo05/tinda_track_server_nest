import type { Transaction } from '@prisma/client';
import { ChargeService } from '../charge/charge.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
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
    private getWalletBalance;
    private buildMovement;
    private buildReference;
}
