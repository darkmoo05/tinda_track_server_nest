import { ProductUnitConversionDto } from './product-unit-conversion.dto.js';
export declare class CreateProductDto {
    name: string;
    sku: string;
    description?: string;
    category?: string;
    baseUnit?: string;
    sellingPrice: number;
    costPrice?: number;
    stockInBaseUnit?: number;
    reorderPoint?: number;
    syncId?: string;
    deviceId?: string;
    isActive?: boolean;
    shelfLocation?: string;
    categorySyncId?: string;
    shelfLocationSyncId?: string;
    expirationDate?: string;
    unitConversions?: ProductUnitConversionDto[];
}
