import { ChargeService } from './charge.service';
import { ChargeItemDto } from './dto/push-charges.dto';
import { PullChargesQueryDto } from './dto/pull-charges-query.dto';
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
