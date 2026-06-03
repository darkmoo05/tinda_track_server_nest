import { PrismaService } from '../../../prisma/prisma.service.js';
import { ChargeItemDto } from './dto/push-charges.dto.js';
import { PullChargesQueryDto } from './dto/pull-charges-query.dto.js';
import type { Charge } from '@prisma/client';
export declare class ChargeService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(userId: string, records: ChargeItemDto[]): Promise<number>;
    pull(userId: string, query: PullChargesQueryDto): Promise<Charge[]>;
    findApplicableCharge(userId: string, amount: number, transactionTypeKey?: string): Promise<Charge | null>;
}
