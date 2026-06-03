import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class AddUtangDto {
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class RecordPaymentDto {
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  note?: string;
}
