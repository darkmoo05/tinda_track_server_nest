export declare class LedgerEntryItemDto {
    syncId: string;
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
    ownerMovementType?: string | null;
    ownerCategory?: string | null;
    ownerPartyName?: string | null;
    ownerPartyAccount?: string | null;
    entryDate: string;
    isDeleted?: boolean;
}
