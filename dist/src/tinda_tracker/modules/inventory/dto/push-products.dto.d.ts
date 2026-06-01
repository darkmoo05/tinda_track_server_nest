export declare class PushProductDto {
    syncId: string;
    deviceId?: string;
    id?: string;
    name: string;
    sku: string;
    description?: string;
    category?: string;
    baseUnit?: string;
    costPrice?: number;
    sellingPrice: number;
    stockInBaseUnit?: number;
    reorderPoint?: number;
    isActive?: boolean;
    imageUrl?: string;
    shelfLocation?: string;
    expirationDate?: string;
    categoryId?: string;
    shelfLocationId?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PullProductsQueryDto {
    since?: string;
    deviceId?: string;
}
