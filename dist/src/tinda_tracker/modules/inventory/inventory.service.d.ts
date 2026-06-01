import type { Product, ProductCategory, ProductUnitConversion, ShelfLocation, StockMovement } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { IStorageProvider } from '../../../core/storage/storage-provider.interface.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CategoryRecordDto } from './dto/push-categories.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { ShelfLocationRecordDto } from './dto/push-shelf-locations.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PullProductsQueryDto, PushProductDto } from './dto/push-products.dto.js';
import { PullProductUnitConversionsQueryDto, PushProductUnitConversionDto } from './dto/push-product-unit-conversions.dto.js';
type ProductWithConversions = Product & {
    unitConversions: ProductUnitConversion[];
};
export declare class InventoryService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: IStorageProvider);
    create(dto: CreateProductDto): Promise<ProductWithConversions>;
    list(query: ListProductsQueryDto): Promise<ProductWithConversions[]>;
    update(productId: string, dto: UpdateProductDto): Promise<ProductWithConversions>;
    updateImage(productId: string, file: Express.Multer.File): Promise<Product>;
    adjustStock(productId: string, dto: AdjustStockDto): Promise<{
        product: Product;
        movement: StockMovement;
    }>;
    getMovements(productId: string): Promise<StockMovement[]>;
    remove(productId: string): Promise<Product>;
    private ensureProductExists;
    pushCategories(records: CategoryRecordDto[]): Promise<ProductCategory[]>;
    pullCategories(sinceMs: number): Promise<ProductCategory[]>;
    listCategories(): Promise<ProductCategory[]>;
    deleteCategory(id: string): Promise<ProductCategory>;
    private assertQuickAccessCapAfterPush;
    pushShelfLocations(records: ShelfLocationRecordDto[]): Promise<ShelfLocation[]>;
    pullShelfLocations(sinceMs: number): Promise<ShelfLocation[]>;
    listShelfLocations(): Promise<ShelfLocation[]>;
    deleteShelfLocation(id: string): Promise<ShelfLocation>;
    updateShelfLocationImage(id: string, file: Express.Multer.File): Promise<ShelfLocation>;
    pushProducts(records: PushProductDto[]): Promise<number>;
    pullProducts(query: PullProductsQueryDto): Promise<Product[]>;
    pushProductUnitConversions(records: PushProductUnitConversionDto[]): Promise<number>;
    pullProductUnitConversions(query: PullProductUnitConversionsQueryDto): Promise<ProductUnitConversion[]>;
}
export {};
