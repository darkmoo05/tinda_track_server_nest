import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	sku?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsOptional()
	category?: string;

	@IsString()
	@IsOptional()
	unit?: string;

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@IsOptional()
	sellingPrice?: number;

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@IsOptional()
	costPrice?: number;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	@IsOptional()
	stockQuantity?: number;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	@IsOptional()
	reorderPoint?: number;

	@IsString()
	@IsOptional()
	deviceId?: string;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
