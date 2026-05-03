import { TransactionDirection, WalletProvider } from '@prisma/client';
export declare class CreateTransactionDto {
    walletProvider: WalletProvider;
    direction: TransactionDirection;
    amount?: number;
    syncId?: string;
    deviceId?: string;
    reference?: string;
    note?: string;
    entryDate?: string;
}
export declare class CreateManualTransactionDto extends CreateTransactionDto {
    amount: number;
}
