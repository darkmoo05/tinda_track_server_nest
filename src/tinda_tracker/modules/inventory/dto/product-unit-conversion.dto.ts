import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProductUnitConversionDto {
  @IsString()
  @IsOptional()
  syncId?: string;

  @IsString()
  @IsNotEmpty()
  unitName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.0000001)
  conversionFactor!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice!: number;
}
