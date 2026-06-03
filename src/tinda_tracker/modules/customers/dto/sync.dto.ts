import {
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PushCustomerDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

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

export class PullCustomersQueryDto {
  @IsString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class PushUtangRecordDto {
  @IsString()
  @IsNotEmpty()
  syncId!: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount!: number;

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

export class PullUtangRecordsQueryDto {
  @IsString()
  @IsOptional()
  since?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
