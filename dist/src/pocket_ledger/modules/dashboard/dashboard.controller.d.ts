import { DashboardService } from './dashboard.service.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(user: AuthUser): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
