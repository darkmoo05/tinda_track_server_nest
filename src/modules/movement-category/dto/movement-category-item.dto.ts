import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MovementCategoryItemDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
