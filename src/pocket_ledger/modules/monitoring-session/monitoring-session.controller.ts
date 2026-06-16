import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MonitoringSessionService } from './monitoring-session.service.js';
import { MonitoringSessionItemDto } from './dto/monitoring-session-item.dto.js';
import { PullMonitoringSessionsQueryDto } from './dto/pull-monitoring-sessions-query.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('monitoring-sessions')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MonitoringSessionController {
  constructor(private readonly monitoringSessionService: MonitoringSessionService) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @CurrentUser() user: AuthUser,
    @Body(new ParseArrayPipe({ items: MonitoringSessionItemDto, whitelist: true })) body: MonitoringSessionItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.monitoringSessionService.push(user.id, body);
    return { success: true, synced };
  }

  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullMonitoringSessionsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.monitoringSessionService.pull(user.id, query);
    return { success: true, data };
  }
}
