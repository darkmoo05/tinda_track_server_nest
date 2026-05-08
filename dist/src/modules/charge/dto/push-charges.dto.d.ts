export declare class ChargeItemDto {
    syncId: string;
    deviceId: string;
    lowerBound: number;
    upperBound: number;
    chargeAmount: number;
    transactionTypeKey?: string;
    isDeleted?: boolean;
}
export declare class PushChargesDto {
    records: ChargeItemDto[];
}
