import { TransactionDirection, WalletProvider } from '@prisma/client';
export declare class ListTransactionsQueryDto {
    walletProvider?: WalletProvider;
    direction?: TransactionDirection;
    limit?: number;
    status?: string;
}
