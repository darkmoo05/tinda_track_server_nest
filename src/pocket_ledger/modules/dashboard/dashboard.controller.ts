import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @CurrentUser() user: AuthUser,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.dashboardService.getDashboard(user.id);
    return { success: true, data };
  }
}

