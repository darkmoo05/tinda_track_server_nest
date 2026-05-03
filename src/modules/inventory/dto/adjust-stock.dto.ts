import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @Type(() => Number)
  @IsInt()
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
}
