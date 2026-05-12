import { TransactionDirection, WalletProvider } from '@prisma/client';
export declare class TransactionPreviewQueryDto {
    walletProvider: WalletProvider;
    direction: TransactionDirection;
    amount: number;
    chargeHandling?: string;
    transactionTypeKey?: string;
}
export declare class TransactionPreviewResponseDto {
    chargeAmount: number;
    totalCollected: number;
    walletCredit: number;
    onHandChange: number;
    feeRoutingExplanation: string;
    currentWalletBalance: number;
    postTransactionWalletBalance: number;
}
