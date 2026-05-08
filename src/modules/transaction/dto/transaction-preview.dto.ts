import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionDirection, WalletProvider } from '@prisma/client';

export class TransactionPreviewQueryDto {
  @IsEnum(WalletProvider)
  walletProvider!: WalletProvider;

  @IsEnum(TransactionDirection)
  direction!: TransactionDirection;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsEnum(['addOnTop', 'deductFromAmount'])
  @IsOptional()
  chargeHandling?: string = 'addOnTop';

  @IsString()
  @IsOptional()
  transactionTypeKey?: string;
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
