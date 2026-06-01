import { InventoryService } from './inventory.service.js';
import { PullProductUnitConversionsQueryDto, PushProductUnitConversionDto } from './dto/push-product-unit-conversions.dto.js';
export declare class ProductUnitConversionsController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    push(body: PushProductUnitConversionDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullProductUnitConversionsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
