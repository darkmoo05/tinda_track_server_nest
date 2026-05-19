import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { CheckoutPosDto } from './dto/checkout-pos.dto.js';
import { ListSalesQueryDto } from './dto/list-sales-query.dto.js';
import { PosService } from './pos.service.js';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkout(@Body() body: CheckoutPosDto): Promise<{ success: boolean; data: unknown }> {
    const data = await this.posService.checkout(body);
    return { success: true, data };
  }

  @Get('sales')
  async listSales(@Query() query: ListSalesQueryDto): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.posService.listSales(query);
    return { success: true, data };
  }
}
