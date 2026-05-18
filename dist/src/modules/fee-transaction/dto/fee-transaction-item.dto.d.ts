export declare class FeeTransactionItemDto {
    syncId: string;
    deviceId: string;
    relatedTransactionSyncId?: string | null;
    feeAmount: number;
    feeType: string;
    chargeDestination: string;
    isDeleted?: boolean;
}
