import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PullMovementCategoriesQueryDto {
  @IsNumberString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
