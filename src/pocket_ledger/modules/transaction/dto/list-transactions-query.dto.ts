import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { TransactionDirection, WalletProvider } from '@prisma/client';

export class ListTransactionsQueryDto {
  @IsEnum(WalletProvider)
  @IsOptional()
  walletProvider?: WalletProvider;

  @IsEnum(TransactionDirection)
  @IsOptional()
  direction?: TransactionDirection;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  status?: string;
}
