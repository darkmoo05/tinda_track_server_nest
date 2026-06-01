import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryRecordDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  /** Originating device for LWW/back-fan filtering. Accepted but currently not persisted. */
  @IsString()
  @IsOptional()
  deviceId?: string;

  /** Client-generated UUID — adopted by the server on first create so that
   *  subsequent pulls return the same id the device already stored locally.
   *  Without this, the server would generate its own id and Flutter's
   *  insertOnConflictUpdate would fail on the UNIQUE syncId constraint. */
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  examples?: string;

  @IsBoolean()
  @IsOptional()
  isQuickAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
