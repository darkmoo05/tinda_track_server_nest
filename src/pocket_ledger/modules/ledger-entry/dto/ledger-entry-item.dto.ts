import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LedgerEntryItemDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  entryType!: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  @IsOptional()
  walletDelta?: number;

  @IsNumber()
  @IsOptional()
  mayaWalletDelta?: number;

  @IsNumber()
  @IsOptional()
  onHandDelta?: number;

  @IsNumber()
  @IsOptional()
  recordedFlow?: number;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  iconKey?: string;

  @IsString()
  @IsOptional()
  walletAccount?: string;

  @IsString()
  @IsOptional()
  ownerScope?: string;

  @IsString()
  @IsOptional()
  ownerMovementType?: string | null;

  @IsString()
  @IsOptional()
  ownerCategory?: string | null;

  @IsString()
  @IsOptional()
  ownerPartyName?: string | null;

  @IsString()
  @IsOptional()
  ownerPartyAccount?: string | null;

  @IsString()
  @IsNotEmpty()
  entryDate!: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
