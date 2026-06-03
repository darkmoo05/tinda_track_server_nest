export declare class PushCustomerDto {
    syncId: string;
    deviceId?: string;
    id?: string;
    name: string;
    phone?: string;
    address?: string;
    notes?: string;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PullCustomersQueryDto {
    since?: string;
    deviceId?: string;
}
export declare class PushUtangRecordDto {
    syncId: string;
    deviceId?: string;
    id?: string;
    customerId: string;
    description?: string;
    amount: number;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare class PullUtangRecordsQueryDto {
    since?: string;
    deviceId?: string;
}
