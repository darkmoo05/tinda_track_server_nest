import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(): Promise<{ success: boolean; data: unknown }> {
    const data = await this.dashboardService.getDashboard();
    return { success: true, data };
  }
}
