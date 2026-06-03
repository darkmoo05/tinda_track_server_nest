import { ChargeService } from './charge.service.js';
import { ChargeItemDto } from './dto/push-charges.dto.js';
import { PullChargesQueryDto } from './dto/pull-charges-query.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class ChargeController {
    private readonly chargeService;
    constructor(chargeService: ChargeService);
    push(user: AuthUser, body: ChargeItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullChargesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
