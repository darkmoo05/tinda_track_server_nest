import { TransactionDirection, WalletProvider } from '@prisma/client';
export declare enum ChargeHandlingMode {
    ADD_ON_TOP = "addOnTop",
    DEDUCT_FROM_AMOUNT = "deductFromAmount"
}
export declare class CreateTransactionDto {
    walletProvider: WalletProvider;
    direction: TransactionDirection;
    amount?: number;
    chargeHandling?: ChargeHandlingMode;
    syncId?: string;
    deviceId?: string;
    reference?: string;
    note?: string;
    entryDate?: string;
    externalProvider?: string;
    externalTransactionId?: string;
    transactionTypeKey?: string;
}
export declare class CreateManualTransactionDto extends CreateTransactionDto {
    amount: number;
}
