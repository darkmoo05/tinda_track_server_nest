import { PartyService } from './party.service';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';
export declare class PartyController {
    private readonly partyService;
    constructor(partyService: PartyService);
    push(body: PartyItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullPartiesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
