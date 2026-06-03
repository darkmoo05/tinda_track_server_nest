import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PosService } from './pos.service.js';
import { PullSalesQueryDto, PushSaleDto } from './dto/push-sales.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('sales')
export class SalesSyncController {
  constructor(private readonly posService: PosService) {}

  /** Bulk upsert sales (with embedded items) from the Flutter sync service. */
  @Post('push')
  async push(
    @CurrentUser() user: AuthUser,
    @Body() body: PushSaleDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.posService.pushSales(user.id, body);
    return { success: true, synced };
  }

  /** Pull — returns sales (with embedded items) updated since [since] ms. */
  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullSalesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.posService.pullSales(user.id, query);
    return { success: true, data };
  }
}
