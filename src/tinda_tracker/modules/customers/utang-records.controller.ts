import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import {
  PullUtangRecordsQueryDto,
  PushUtangRecordDto,
} from './dto/sync.dto.js';
import { Public } from '../../../modules/auth/decorators/public.decorator.js';

@Controller('utang-records')
export class UtangRecordsController {
  constructor(private readonly customersService: CustomersService) {}

  /** Bulk upsert from the Flutter sync service. */
  @Public()
  @Post('push')
  async push(
    @Body() body: PushUtangRecordDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.customersService.pushUtangRecords(body);
    return { success: true, synced };
  }

  /** Pull — returns utang records updated since [since] ms; excludes own deviceId. */
  @Public()
  @Get('pull')
  async pull(
    @Query() query: PullUtangRecordsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.customersService.pullUtangRecords(query);
    return { success: true, data };
  }
}
