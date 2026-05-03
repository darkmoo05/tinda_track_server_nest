import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
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
  unit?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  reorderPoint?: number;

  @IsString()
  @IsOptional()
  syncId?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
