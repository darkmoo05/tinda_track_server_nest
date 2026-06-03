import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';
import {
  PullProductUnitConversionsQueryDto,
  PushProductUnitConversionDto,
} from './dto/push-product-unit-conversions.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('inventory/product-unit-conversions')
export class ProductUnitConversionsController {
  constructor(private readonly inventoryService: InventoryService) {}

  /** Bulk upsert from the Flutter sync service. */
  @Post('push')
  async push(
    @CurrentUser() user: AuthUser,
    @Body() body: PushProductUnitConversionDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.inventoryService.pushProductUnitConversions(user.id, body);
    return { success: true, synced };
  }

  /** Pull — returns conversions updated since [since] ms. */
  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullProductUnitConversionsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.pullProductUnitConversions(user.id, query);
    return { success: true, data };
  }
}
