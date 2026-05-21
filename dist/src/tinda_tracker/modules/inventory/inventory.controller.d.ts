import { InventoryService } from './inventory.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(body: CreateProductDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    list(query: ListProductsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    update(id: string, body: UpdateProductDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        success: boolean;
        data: unknown;
    }>;
    adjustStock(id: string, body: AdjustStockDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    getMovements(id: string): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
