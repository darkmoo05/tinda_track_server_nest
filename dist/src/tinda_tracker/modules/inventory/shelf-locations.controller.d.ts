import { InventoryService } from './inventory.service.js';
import { ShelfLocationRecordDto } from './dto/push-shelf-locations.dto.js';
export declare class ShelfLocationsController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    list(): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    push(body: ShelfLocationRecordDto[]): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    pull(since: string, _deviceId?: string): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        success: boolean;
        data: unknown;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
