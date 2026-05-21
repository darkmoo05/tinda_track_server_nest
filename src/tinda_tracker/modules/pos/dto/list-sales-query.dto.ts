import { Type } from 'class-transformer';
import { IsDateString, IsOptional, Min } from 'class-validator';

export class ListSalesQueryDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
