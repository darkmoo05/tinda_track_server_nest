import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WalletProvider, TransactionDirection, OcrStatus, TransactionStatus } from '@prisma/client';

export class PushChargeDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsNumber()
  lowerBound!: number;

  @IsNumber()
  upperBound!: number;

  @IsNumber()
  chargeAmount!: number;

  @IsString()
  @IsOptional()
  transactionTypeKey?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushPartyDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  joinDate!: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushTransactionTypeDto {
  @IsString()
  @IsOptional()
  id?: string;

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

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushMovementCategoryDto {
  @IsString()
  @IsOptional()
  id?: string;

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
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushFeeTransactionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsOptional()
  relatedTransactionSyncId?: string;

  @IsNumber()
  feeAmount!: number;

  @IsString()
  @IsNotEmpty()
  feeType!: string;

  @IsString()
  @IsNotEmpty()
  chargeDestination!: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushTransactionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsEnum(WalletProvider)
  walletProvider!: WalletProvider;

  @IsEnum(TransactionDirection)
  direction!: TransactionDirection;

  @IsNumber()
  amount!: number;

  @IsNumber()
  @IsOptional()
  chargeAmount?: number;

  @IsNumber()
  totalAmount!: number;

  @IsNumber()
  balanceBefore!: number;

  @IsNumber()
  balanceAfter!: number;

  @IsNumber()
  @IsOptional()
  chargeLowerBound?: number;

  @IsNumber()
  @IsOptional()
  chargeUpperBound?: number;

  @IsString()
  @IsOptional()
  chargeHandling?: string;

  @IsString()
  @IsOptional()
  receiptImagePath?: string;

  @IsString()
  @IsOptional()
  receiptOriginalName?: string;

  @IsString()
  @IsOptional()
  receiptMimeType?: string;

  @IsISO8601()
  @IsOptional()
  receiptUploadedAt?: string;

  @IsEnum(OcrStatus)
  @IsOptional()
  ocrStatus?: OcrStatus;

  @IsNumber()
  @IsOptional()
  ocrExtractedAmount?: number;

  @IsString()
  @IsOptional()
  ocrRawText?: string;

  @IsISO8601()
  @IsOptional()
  ocrProcessedAt?: string;

  @IsString()
  @IsOptional()
  externalProvider?: string;

  @IsString()
  @IsOptional()
  externalTransactionId?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  entryDate?: string;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushLedgerEntryDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

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
  ownerMovementType?: string;

  @IsString()
  @IsOptional()
  ownerCategory?: string;

  @IsString()
  @IsOptional()
  ownerPartyName?: string;

  @IsString()
  @IsOptional()
  ownerPartyAccount?: string;

  @IsString()
  @IsOptional()
  entryDate?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushProductCategoryDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  examples?: string;

  @IsBoolean()
  @IsOptional()
  isQuickAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushShelfLocationDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  examples?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushProductDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  baseUnit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockInBaseUnit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  reorderPoint?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  shelfLocation?: string;

  @IsISO8601()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  shelfLocationId?: string;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushProductUnitConversionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  unitName!: string;

  @IsNumber()
  conversionFactor!: number;

  @IsNumber()
  costPrice!: number;

  @IsNumber()
  sellingPrice!: number;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushSaleItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  saleId?: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  selectedUnit!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @Min(0)
  computedBaseQuantity!: number;

  @IsNumber()
  @Min(0)
  lineTotal!: number;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;
}

export class PushSaleDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  subtotal!: number;

  @IsNumber()
  totalAmount!: number;

  @IsNumber()
  paidAmount!: number;

  @IsNumber()
  @IsOptional()
  changeAmount?: number;

  @IsInt()
  totalItems!: number;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushSaleItemDto)
  @IsOptional()
  items?: PushSaleItemDto[];

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushCustomerDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class PushUtangRecordDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount!: number;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}

export class SyncPushDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushProductCategoryDto)
  @IsOptional()
  productCategories?: PushProductCategoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushShelfLocationDto)
  @IsOptional()
  shelfLocations?: PushShelfLocationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushProductDto)
  @IsOptional()
  products?: PushProductDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushProductUnitConversionDto)
  @IsOptional()
  productUnitConversions?: PushProductUnitConversionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushCustomerDto)
  @IsOptional()
  customers?: PushCustomerDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushUtangRecordDto)
  @IsOptional()
  utangRecords?: PushUtangRecordDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushSaleDto)
  @IsOptional()
  sales?: PushSaleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushChargeDto)
  @IsOptional()
  charges?: PushChargeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushPartyDto)
  @IsOptional()
  parties?: PushPartyDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushTransactionTypeDto)
  @IsOptional()
  transactionTypes?: PushTransactionTypeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushMovementCategoryDto)
  @IsOptional()
  movementCategories?: PushMovementCategoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushFeeTransactionDto)
  @IsOptional()
  feeTransactions?: PushFeeTransactionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushTransactionDto)
  @IsOptional()
  transactions?: PushTransactionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushLedgerEntryDto)
  @IsOptional()
  ledgerEntries?: PushLedgerEntryDto[];
}

export class SyncRequestDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsNumber()
  @IsOptional()
  lastSync?: number;

  @ValidateNested()
  @Type(() => SyncPushDto)
  @IsOptional()
  push?: SyncPushDto;
}
