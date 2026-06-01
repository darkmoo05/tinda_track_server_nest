import {
  IsBoolean,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PushProductDto {
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

export class PullProductsQueryDto {
  @IsString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
