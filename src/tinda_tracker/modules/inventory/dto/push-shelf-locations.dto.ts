import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShelfLocationRecordDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

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
