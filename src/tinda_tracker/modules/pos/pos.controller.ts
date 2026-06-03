import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { CheckoutPosDto } from './dto/checkout-pos.dto.js';
import { ListSalesQueryDto } from './dto/list-sales-query.dto.js';
import { PosService } from './pos.service.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkout(
    @CurrentUser() user: AuthUser,
    @Body() body: CheckoutPosDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.posService.checkout(user.id, body);
    return { success: true, data };
  }

  @Get('sales')
  async listSales(
    @CurrentUser() user: AuthUser,
    @Query() query: ListSalesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.posService.listSales(user.id, query);
    return { success: true, data };
  }

  @Get('dashboard')
  async getDashboard(
    @CurrentUser() user: AuthUser,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.posService.getDashboardStats(user.id);
    return { success: true, data };
  }

  @Get('reports')
  async getReports(
    @CurrentUser() user: AuthUser,
    @Query() query: ListSalesQueryDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.posService.getReports(user.id, query);
    return { success: true, data };
  }
}

