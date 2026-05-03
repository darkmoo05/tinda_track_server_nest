import { IsNumberString, IsOptional, IsString } from 'class-validator';

/**
 * Query parameters for the pull endpoint.
 *
 * since    — Unix timestamp (ms). Only records updated after this moment are returned.
 * deviceId — The requesting device's ID. Records that originated on this device
 *             are excluded so a device never re-downloads its own data.
 */
export class PullChargesQueryDto {
  @IsNumberString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
