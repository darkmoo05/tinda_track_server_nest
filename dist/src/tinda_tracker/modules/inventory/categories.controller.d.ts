import { InventoryService } from './inventory.service.js';
import { CategoryRecordDto } from './dto/push-categories.dto.js';
export declare class CategoriesController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    list(): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    push(body: CategoryRecordDto[]): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    pull(since: string): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
