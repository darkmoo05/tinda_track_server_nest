import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PullPartiesQueryDto {
  @IsNumberString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
