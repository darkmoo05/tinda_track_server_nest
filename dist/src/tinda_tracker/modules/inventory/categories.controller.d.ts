import { InventoryService } from './inventory.service.js';
import { CategoryRecordDto } from './dto/push-categories.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class CategoriesController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    list(): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    push(user: AuthUser, body: CategoryRecordDto[]): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    pull(user: AuthUser, since: string, _deviceId?: string): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
