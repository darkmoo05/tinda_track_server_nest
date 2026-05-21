import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import { CategoryRecordDto } from './dto/push-categories.dto.js';

@Controller('inventory/categories')
export class CategoriesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async list(): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.listCategories();
    return { success: true, data };
  }

  /** Bulk upsert — called by the Flutter sync service. */
  @Post('push')
  async push(
    @Body() body: CategoryRecordDto[],
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.pushCategories(body);
    return { success: true, data };
  }

  /**
   * Pull — returns all categories updated since [since] milliseconds epoch.
   * Called by the Flutter sync service to receive server-side changes.
   */
  @Get('pull')
  async pull(
    @Query('since') since: string,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const sinceMs = parseInt(since ?? '0', 10);
    const data = await this.inventoryService.pullCategories(sinceMs);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.deleteCategory(id);
    return { success: true, data };
  }
}
