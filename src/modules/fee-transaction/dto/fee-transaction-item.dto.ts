import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Represents a single FeeTransaction record pushed from a device.
 * Mirrors the local SQLite fee_transactions table schema.
 */
export class FeeTransactionItemDto {
  /** Client-generated UUID — acts as the upsert key. */
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  /** Identifier of the originating device. */
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  /**
   * syncId of the ledger entry this fee is attached to.
   * Optional because the fee may be recorded before the parent is confirmed.
   */
  @IsString()
  @IsOptional()
  relatedTransactionSyncId?: string | null;

  /** The fee amount collected. */
  @IsNumber()
  feeAmount!: number;

  /** The transaction type label, e.g. "GCash Cash In". */
  @IsString()
  @IsNotEmpty()
  feeType!: string;

  /** The account where the fee income is deposited, e.g. "On-hand Cash". */
  @IsString()
  @IsNotEmpty()
  chargeDestination!: string;

  /** Soft-delete flag. Defaults to false. */
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
