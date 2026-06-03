import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import {
  PullUtangRecordsQueryDto,
  PushUtangRecordDto,
} from './dto/sync.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('utang-records')
export class UtangRecordsController {
  constructor(private readonly customersService: CustomersService) {}

  /** Bulk upsert from the Flutter sync service. */
  @Post('push')
  async push(
    @CurrentUser() user: AuthUser,
    @Body() body: PushUtangRecordDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.customersService.pushUtangRecords(user.id, body);
    return { success: true, synced };
  }

  /** Pull — returns utang records updated since [since] ms; excludes own deviceId. */
  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullUtangRecordsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.customersService.pullUtangRecords(user.id, query);
    return { success: true, data };
  }
}
