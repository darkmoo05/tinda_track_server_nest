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
    create(userId: string, dto: CreateProductDto): Promise<ProductWithConversions>;
    list(userId: string, query: ListProductsQueryDto): Promise<ProductWithConversions[]>;
    update(userId: string, productId: string, dto: UpdateProductDto): Promise<ProductWithConversions>;
    updateImage(userId: string, productId: string, file: Express.Multer.File): Promise<Product>;
    adjustStock(userId: string, productId: string, dto: AdjustStockDto): Promise<{
        product: Product;
        movement: StockMovement;
    }>;
    getMovements(userId: string, productId: string): Promise<StockMovement[]>;
    remove(userId: string, productId: string): Promise<Product>;
    private ensureProductExists;
    pushCategories(userId: string, records: CategoryRecordDto[]): Promise<ProductCategory[]>;
    pullCategories(userId: string, sinceMs: number): Promise<ProductCategory[]>;
    listCategories(): Promise<ProductCategory[]>;
    deleteCategory(id: string): Promise<ProductCategory>;
    private assertQuickAccessCapAfterPush;
    pushShelfLocations(userId: string, records: ShelfLocationRecordDto[]): Promise<ShelfLocation[]>;
    pullShelfLocations(userId: string, sinceMs: number): Promise<ShelfLocation[]>;
    listShelfLocations(userId: string): Promise<ShelfLocation[]>;
    deleteShelfLocation(userId: string, id: string): Promise<ShelfLocation>;
    updateShelfLocationImage(userId: string, id: string, file: Express.Multer.File): Promise<ShelfLocation>;
    pushProducts(userId: string, records: PushProductDto[]): Promise<number>;
    pullProducts(userId: string, query: PullProductsQueryDto): Promise<Product[]>;
    pushProductUnitConversions(userId: string, records: PushProductUnitConversionDto[]): Promise<number>;
    pullProductUnitConversions(userId: string, query: PullProductUnitConversionsQueryDto): Promise<ProductUnitConversion[]>;
}
export {};
