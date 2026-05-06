import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionDirection, WalletProvider } from '@prisma/client';

export enum ChargeHandlingMode {
  ADD_ON_TOP = 'addOnTop',
  DEDUCT_FROM_AMOUNT = 'deductFromAmount',
}

export class CreateTransactionDto {
  @IsEnum(WalletProvider)
  walletProvider!: WalletProvider;

  @IsEnum(TransactionDirection)
  direction!: TransactionDirection;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(ChargeHandlingMode)
  @IsOptional()
  chargeHandling?: ChargeHandlingMode = ChargeHandlingMode.ADD_ON_TOP;

  @IsString()
  @IsOptional()
  syncId?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  entryDate?: string;

  @IsString()
  @IsOptional()
  externalProvider?: string;

  @IsString()
  @IsOptional()
  externalTransactionId?: string;
}

export class CreateManualTransactionDto extends CreateTransactionDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  declare amount: number;
}
