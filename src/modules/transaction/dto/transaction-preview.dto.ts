import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionDirection, WalletProvider } from '@prisma/client';

export class TransactionPreviewQueryDto {
  @IsEnum(WalletProvider)
  walletProvider!: WalletProvider;

  @IsEnum(TransactionDirection)
  direction!: TransactionDirection;

  @IsNumber()
  amount!: number;

  @IsEnum(['addOnTop', 'deductFromAmount'])
  @IsOptional()
  chargeHandling?: string = 'addOnTop';
}

export class TransactionPreviewResponseDto {
  chargeAmount: number;
  totalCollected: number;
  walletCredit: number;
  onHandChange: number;
  feeRoutingExplanation: string;
  currentWalletBalance: number;
  postTransactionWalletBalance: number;
}
