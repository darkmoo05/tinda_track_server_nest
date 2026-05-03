import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PullTransactionTypesQueryDto {
  @IsNumberString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
