import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShelfLocationRecordDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  /** Originating device for LWW/back-fan filtering. Accepted but currently not persisted. */
  @IsString()
  @IsOptional()
  deviceId?: string;

  /** Client-generated UUID — adopted by the server on first create so that
   *  subsequent pulls return the same id the device already stored locally. */
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

  /** Server-managed; clients may send back what they have but the server is
   *  authoritative — it only changes via PATCH /:id/image. */
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
