import { PrismaService } from '../../../prisma/prisma.service.js';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        gcashBalance: any;
        mayaBalance: any;
        onHandBalance: any;
        totalRecordedFlow: any;
        recentEntries: any;
    }>;
}
