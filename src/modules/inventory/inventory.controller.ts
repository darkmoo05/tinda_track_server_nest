import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Controller('inventory/products')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(@Body() body: CreateProductDto): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.create(body);
    return { success: true, data };
  }

  @Get()
  async list(@Query() query: ListProductsQueryDto): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.list(query);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.update(id, body);
    return { success: true, data };
  }

  @Post(':id/adjust-stock')
  async adjustStock(
    @Param('id') id: string,
    @Body() body: AdjustStockDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.adjustStock(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.remove(id);
    return { success: true, data };
  }
}
