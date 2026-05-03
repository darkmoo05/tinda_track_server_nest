import type { Party } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';
export declare class PartyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(records: PartyItemDto[]): Promise<number>;
    pull(query: PullPartiesQueryDto): Promise<Party[]>;
}
