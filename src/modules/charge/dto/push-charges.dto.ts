import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Represents a single Charge record pushed from a device.
 * Mirrors the Mongoose Charge schema exactly so existing Flutter clients
 * require zero changes.
 */
export class ChargeItemDto {
  /** Client-generated UUID — acts as the upsert key. */
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  /** Identifier of the originating device. */
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  /** Lower bound (inclusive) of the transaction amount range. */
  @IsNumber()
  lowerBound!: number;

  /** Upper bound (inclusive) of the transaction amount range. */
  @IsNumber()
  upperBound!: number;

  /** Fixed charge fee applied when the transaction amount falls in range. */
  @IsNumber()
  chargeAmount!: number;

  /** Soft-delete flag. Defaults to false. */
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}

/**
 * The push endpoint expects an array of ChargeItemDto records.
 */
export class PushChargesDto {
  @ValidateNested({ each: true })
  @Type(() => ChargeItemDto)
  records!: ChargeItemDto[];
}
