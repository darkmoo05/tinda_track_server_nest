import {
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PushProductUnitConversionDto {
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
  productId!: string;

  @IsString()
  @IsNotEmpty()
  unitName!: string;

  @IsNumber()
  @Min(0)
  conversionFactor!: number;

  @IsNumber()
  @Min(0)
  costPrice!: number;

  @IsNumber()
  @Min(0)
  sellingPrice!: number;

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

export class PullProductUnitConversionsQueryDto {
  @IsString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
