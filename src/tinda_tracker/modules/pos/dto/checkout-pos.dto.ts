import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class CheckoutPosItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  quantity!: number;

  @IsString()
  @IsOptional()
  selectedUnit?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  computedBaseQuantity?: number;
}

export class CheckoutPosDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutPosItemDto)
  items!: CheckoutPosItemDto[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paidAmount!: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}

export { CheckoutPosItemDto };
