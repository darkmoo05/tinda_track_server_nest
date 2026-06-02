import { ChargeService } from './charge.service.js';
import { ChargeItemDto } from './dto/push-charges.dto.js';
import { PullChargesQueryDto } from './dto/pull-charges-query.dto.js';
export declare class ChargeController {
    private readonly chargeService;
    constructor(chargeService: ChargeService);
    push(body: ChargeItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullChargesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
