import { PosService } from './pos.service.js';
import { PullSalesQueryDto, PushSaleDto } from './dto/push-sales.dto.js';
export declare class SalesSyncController {
    private readonly posService;
    constructor(posService: PosService);
    push(body: PushSaleDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullSalesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
