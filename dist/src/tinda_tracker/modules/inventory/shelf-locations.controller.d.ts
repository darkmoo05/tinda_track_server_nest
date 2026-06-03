import { InventoryService } from './inventory.service.js';
import { ShelfLocationRecordDto } from './dto/push-shelf-locations.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class ShelfLocationsController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    list(user: AuthUser): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    push(user: AuthUser, body: ShelfLocationRecordDto[]): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    pull(user: AuthUser, since: string, _deviceId?: string): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    uploadImage(user: AuthUser, id: string, file: Express.Multer.File): Promise<{
        success: boolean;
        data: unknown;
    }>;
    remove(user: AuthUser, id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
