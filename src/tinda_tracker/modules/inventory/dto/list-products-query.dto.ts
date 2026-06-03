import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Min } from 'class-validator';

export class ListProductsQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 50;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;
}
