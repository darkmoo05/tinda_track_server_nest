import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @Type(() => Number)
  @IsNumber()
  quantityDelta!: number;

  @IsEnum(StockMovementType)
  @IsOptional()
  movementType?: StockMovementType;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsISO8601()
  @IsOptional()
  expirationDate?: string;
}
