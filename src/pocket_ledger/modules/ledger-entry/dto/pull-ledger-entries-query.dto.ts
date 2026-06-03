import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PullLedgerEntriesQueryDto {
  @IsNumberString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
