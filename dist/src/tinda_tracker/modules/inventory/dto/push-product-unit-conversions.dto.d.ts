export declare class PushProductUnitConversionDto {
    syncId: string;
    deviceId?: string;
    id?: string;
    productId: string;
    unitName: string;
    conversionFactor: number;
    costPrice: number;
    sellingPrice: number;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PullProductUnitConversionsQueryDto {
    since?: string;
    deviceId?: string;
}
