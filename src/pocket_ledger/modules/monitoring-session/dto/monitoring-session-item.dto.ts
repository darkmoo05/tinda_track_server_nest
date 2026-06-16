import { ValidateIf, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsISO8601 } from 'class-validator';

export class MonitoringSessionItemDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsNotEmpty()
  startDateMs!: number;

  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsOptional()
  endDateMs?: number | null;

  @IsNumber()
  @IsOptional()
  startGcash?: number;

  @IsNumber()
  @IsOptional()
  startMaya?: number;

  @IsNumber()
  @IsOptional()
  startOnHand?: number;

  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsOptional()
  endGcash?: number | null;

  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsOptional()
  endMaya?: number | null;

  @ValidateIf((o, v) => v !== null)
  @IsNumber()
  @IsOptional()
  endOnHand?: number | null;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}
