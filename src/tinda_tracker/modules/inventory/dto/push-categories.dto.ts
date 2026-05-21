import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryRecordDto {
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

  @IsBoolean()
  @IsOptional()
  isQuickAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
