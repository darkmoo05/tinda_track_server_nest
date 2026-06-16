import { PrismaService } from '../../../prisma/prisma.service.js';
import { MonitoringSessionItemDto } from './dto/monitoring-session-item.dto.js';
import { PullMonitoringSessionsQueryDto } from './dto/pull-monitoring-sessions-query.dto.js';
export declare class MonitoringSessionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(userId: string, records: MonitoringSessionItemDto[]): Promise<number>;
    pull(userId: string, query: PullMonitoringSessionsQueryDto): Promise<any>;
}
