import { CustomersService } from './customers.service.js';
import { PullUtangRecordsQueryDto, PushUtangRecordDto } from './dto/sync.dto.js';
export declare class UtangRecordsController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    push(body: PushUtangRecordDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullUtangRecordsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
