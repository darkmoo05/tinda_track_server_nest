import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { AddUtangDto, RecordPaymentDto } from './dto/utang.dto.js';
import { PullCustomersQueryDto, PushCustomerDto } from './dto/sync.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async list(): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.customersService.list();
    return { success: true, data };
  }

  /** Bulk upsert from the Flutter sync service. */
  @Post('push')
  async push(
    @CurrentUser() user: AuthUser,
    @Body() body: PushCustomerDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.customersService.pushCustomers(user.id, body);
    return { success: true, synced };
  }

  /** Pull — returns all customers updated since [since] ms; excludes own deviceId. */
  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullCustomersQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.customersService.pullCustomers(user.id, query);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<{ success: boolean; data: unknown }> {
    const data = await this.customersService.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: CreateCustomerDto): Promise<{ success: boolean; data: unknown }> {
    const data = await this.customersService.create(body);
    return { success: true, data };
  }

  @Post(':id/utang')
  async addUtang(
    @Param('id') id: string,
    @Body() body: AddUtangDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.customersService.addUtang(id, body);
    return { success: true, data };
  }

  @Post(':id/payment')
  async recordPayment(
    @Param('id') id: string,
    @Body() body: RecordPaymentDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.customersService.recordPayment(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean; data: unknown }> {
    const data = await this.customersService.remove(id);
    return { success: true, data };
  }
}
