import type { Party } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';
export declare class PartyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(userId: string, records: PartyItemDto[]): Promise<number>;
    pull(userId: string, query: PullPartiesQueryDto): Promise<Party[]>;
}
