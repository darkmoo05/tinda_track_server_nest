export declare class CreateProductDto {
    name: string;
    sku: string;
    description?: string;
    category?: string;
    unit?: string;
    sellingPrice: number;
    costPrice?: number;
    stockQuantity?: number;
    reorderPoint?: number;
    syncId?: string;
    deviceId?: string;
    isActive?: boolean;
    shelfLocation?: string;
    categorySyncId?: string;
    shelfLocationSyncId?: string;
    expirationDate?: string;
}
