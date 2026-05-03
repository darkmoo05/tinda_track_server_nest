import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class ListSalesQueryDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
