import { WalletProvider, TransactionDirection, OcrStatus, TransactionStatus } from '@prisma/client';
export declare class PushChargeDto {
    id?: string;
    syncId: string;
    deviceId: string;
    lowerBound: number;
    upperBound: number;
    chargeAmount: number;
    transactionTypeKey?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushPartyDto {
    id?: string;
    syncId: string;
    deviceId: string;
    name: string;
    accountNumber: string;
    entityId?: string;
    description?: string;
    joinDate: string;
    isVerified?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushTransactionTypeDto {
    id?: string;
    syncId: string;
    deviceId: string;
    name: string;
    isOutflow?: boolean;
    walletAccount?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushMovementCategoryDto {
    id?: string;
    syncId: string;
    deviceId: string;
    name: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushFeeTransactionDto {
    id?: string;
    syncId: string;
    deviceId: string;
    relatedTransactionSyncId?: string;
    feeAmount: number;
    feeType: string;
    chargeDestination: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushTransactionDto {
    id?: string;
    syncId: string;
    deviceId?: string;
    walletProvider: WalletProvider;
    direction: TransactionDirection;
    amount: number;
    chargeAmount?: number;
    totalAmount: number;
    balanceBefore: number;
    balanceAfter: number;
    chargeLowerBound?: number;
    chargeUpperBound?: number;
    chargeHandling?: string;
    receiptImagePath?: string;
    receiptOriginalName?: string;
    receiptMimeType?: string;
    receiptUploadedAt?: string;
    ocrStatus?: OcrStatus;
    ocrExtractedAmount?: number;
    ocrRawText?: string;
    ocrProcessedAt?: string;
    externalProvider?: string;
    externalTransactionId?: string;
    note?: string;
    reference?: string;
    entryDate: string;
    status?: TransactionStatus;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushLedgerEntryDto {
    id?: string;
    syncId: string;
    transactionId?: string;
    deviceId: string;
    entryType: string;
    title?: string;
    note?: string;
    reference?: string;
    amount: number;
    walletDelta?: number;
    mayaWalletDelta?: number;
    onHandDelta?: number;
    recordedFlow?: number;
    tag?: string;
    iconKey?: string;
    walletAccount?: string;
    ownerScope?: string;
    ownerMovementType?: string;
    ownerCategory?: string;
    ownerPartyName?: string;
    ownerPartyAccount?: string;
    entryDate: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushProductCategoryDto {
    id?: string;
    syncId: string;
    name: string;
    description?: string;
    examples?: string;
    isQuickAccess?: boolean;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushShelfLocationDto {
    id?: string;
    syncId: string;
    name: string;
    description?: string;
    examples?: string;
    imageUrl?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushProductDto {
    id?: string;
    syncId: string;
    deviceId?: string;
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
    isDeleted?: boolean;
    imageUrl?: string;
    shelfLocation?: string;
    expirationDate?: string;
    categoryId?: string;
    shelfLocationId?: string;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushProductUnitConversionDto {
    id?: string;
    syncId: string;
    productId: string;
    unitName: string;
    conversionFactor: number;
    costPrice: number;
    sellingPrice: number;
    createdAt?: string;
    updatedAt?: string;
}
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
    id?: string;
    syncId: string;
    reference: string;
    deviceId?: string;
    note?: string;
    subtotal: number;
    totalAmount: number;
    paidAmount: number;
    changeAmount?: number;
    totalItems: number;
    isDeleted?: boolean;
    items?: PushSaleItemDto[];
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushCustomerDto {
    id?: string;
    syncId: string;
    deviceId?: string;
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PushUtangRecordDto {
    id?: string;
    syncId: string;
    deviceId?: string;
    customerId: string;
    description?: string;
    amount: number;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class SyncPushDto {
    productCategories?: PushProductCategoryDto[];
    shelfLocations?: PushShelfLocationDto[];
    products?: PushProductDto[];
    productUnitConversions?: PushProductUnitConversionDto[];
    customers?: PushCustomerDto[];
    utangRecords?: PushUtangRecordDto[];
    sales?: PushSaleDto[];
    charges?: PushChargeDto[];
    parties?: PushPartyDto[];
    transactionTypes?: PushTransactionTypeDto[];
    movementCategories?: PushMovementCategoryDto[];
    feeTransactions?: PushFeeTransactionDto[];
    transactions?: PushTransactionDto[];
    ledgerEntries?: PushLedgerEntryDto[];
}
export declare class SyncRequestDto {
    deviceId: string;
    lastSync?: number;
    push?: SyncPushDto;
}
