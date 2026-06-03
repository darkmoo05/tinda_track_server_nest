import { InventoryService } from './inventory.service.js';
import { PullProductUnitConversionsQueryDto, PushProductUnitConversionDto } from './dto/push-product-unit-conversions.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class ProductUnitConversionsController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    push(user: AuthUser, body: PushProductUnitConversionDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullProductUnitConversionsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
