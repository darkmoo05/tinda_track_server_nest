import {
  IsArray,
  IsBoolean,
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
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @Min(0)
  subtotal!: number;

  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsNumber()
  @Min(0)
  paidAmount!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  changeAmount?: number;

  @IsInt()
  @Min(0)
  totalItems!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushSaleItemDto)
  items!: PushSaleItemDto[];

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

export class PullSalesQueryDto {
  @IsString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
