export declare class MonitoringSessionItemDto {
    syncId: string;
    deviceId: string;
    name: string;
    status?: string;
    startDateMs: number;
    endDateMs?: number | null;
    startGcash?: number;
    startMaya?: number;
    startOnHand?: number;
    endGcash?: number | null;
    endMaya?: number | null;
    endOnHand?: number | null;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
