import { MonitoringSessionService } from './monitoring-session.service.js';
import { MonitoringSessionItemDto } from './dto/monitoring-session-item.dto.js';
import { PullMonitoringSessionsQueryDto } from './dto/pull-monitoring-sessions-query.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class MonitoringSessionController {
    private readonly monitoringSessionService;
    constructor(monitoringSessionService: MonitoringSessionService);
    push(user: AuthUser, body: MonitoringSessionItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullMonitoringSessionsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
