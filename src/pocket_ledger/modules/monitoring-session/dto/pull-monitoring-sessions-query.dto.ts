import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PullMonitoringSessionsQueryDto {
  @IsNumberString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
