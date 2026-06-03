import { PartyService } from './party.service.js';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class PartyController {
    private readonly partyService;
    constructor(partyService: PartyService);
    push(user: AuthUser, body: PartyItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullPartiesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
