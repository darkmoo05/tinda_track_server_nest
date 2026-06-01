export declare class PushSaleItemDto {
    id?: string;
    saleId?: string;
    productId: string;
    selectedUnit: string;
    quantity: number;
    unitPrice: number;
    computedBaseQuantity: number;
    lineTotal: number;
    createdAt?: string;
}
export declare class PushSaleDto {
    syncId: string;
    deviceId?: string;
    id?: string;
    reference: string;
    note?: string;
    subtotal: number;
    totalAmount: number;
    paidAmount: number;
    changeAmount?: number;
    totalItems: number;
    items: PushSaleItemDto[];
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PullSalesQueryDto {
    since?: string;
    deviceId?: string;
}
