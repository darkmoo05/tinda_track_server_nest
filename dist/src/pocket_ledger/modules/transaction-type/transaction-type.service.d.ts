import type { TransactionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TransactionTypeItemDto } from './dto/transaction-type-item.dto.js';
import { PullTransactionTypesQueryDto } from './dto/pull-transaction-types-query.dto.js';
export declare class TransactionTypeService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(records: TransactionTypeItemDto[]): Promise<number>;
    pull(query: PullTransactionTypesQueryDto): Promise<TransactionType[]>;
}
