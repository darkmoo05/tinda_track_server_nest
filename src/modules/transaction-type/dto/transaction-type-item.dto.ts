import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransactionTypeItemDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  isOutflow?: boolean;

  @IsString()
  @IsOptional()
  walletAccount?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
