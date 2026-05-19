import type { Product, StockMovement } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProductDto): Promise<Product>;
    list(query: ListProductsQueryDto): Promise<Product[]>;
    update(productId: string, dto: UpdateProductDto): Promise<Product>;
    adjustStock(productId: string, dto: AdjustStockDto): Promise<{
        product: Product;
        movement: StockMovement;
    }>;
    remove(productId: string): Promise<Product>;
    private ensureProductExists;
}
