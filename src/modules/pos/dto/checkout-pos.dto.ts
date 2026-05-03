import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class CheckoutPosItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @Type(() => Number)
  quantity!: number;
}

export class CheckoutPosDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutPosItemDto)
  items!: CheckoutPosItemDto[];

  @Type(() => Number)
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
