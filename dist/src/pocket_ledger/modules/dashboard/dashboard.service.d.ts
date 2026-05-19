import { PrismaService } from '../../../prisma/prisma.service.js';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        gcashBalance: number;
        mayaBalance: number;
        onHandBalance: number;
        totalRecordedFlow: number;
        recentEntries: {
            id: string;
            syncId: string;
            deviceId: string;
            isDeleted: boolean;
            createdAt: Date;
            updatedAt: Date;
            walletAccount: string;
            entryType: string;
            title: string;
            note: string;
            reference: string;
            amount: number;
            walletDelta: number;
            mayaWalletDelta: number;
            onHandDelta: number;
            recordedFlow: number;
            tag: string;
            iconKey: string;
            ownerScope: string;
            ownerMovementType: string | null;
            ownerCategory: string | null;
            ownerPartyName: string | null;
            ownerPartyAccount: string | null;
            entryDate: string;
            transactionId: string | null;
        }[];
    }>;
}
