import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ProductUnitConversionDto } from './product-unit-conversion.dto.js';

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
	baseUnit?: string;

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
	@IsNumber()
	@Min(0)
	@IsOptional()
	stockInBaseUnit?: number;

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

	@IsString()
	@IsOptional()
	shelfLocation?: string;

	@IsString()
	@IsOptional()
	categorySyncId?: string;

	@IsString()
	@IsOptional()
	shelfLocationSyncId?: string;

	@IsString()
	@IsOptional()
	expirationDate?: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ProductUnitConversionDto)
	@IsOptional()
	unitConversions?: ProductUnitConversionDto[];
}
