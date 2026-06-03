import { InventoryService } from './inventory.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PullProductsQueryDto, PushProductDto } from './dto/push-products.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(user: AuthUser, body: CreateProductDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    list(user: AuthUser, query: ListProductsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    push(user: AuthUser, body: PushProductDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullProductsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    update(user: AuthUser, id: string, body: UpdateProductDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    uploadImage(user: AuthUser, id: string, file: Express.Multer.File): Promise<{
        success: boolean;
        data: unknown;
    }>;
    adjustStock(user: AuthUser, id: string, body: AdjustStockDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    getMovements(user: AuthUser, id: string): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    remove(user: AuthUser, id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
