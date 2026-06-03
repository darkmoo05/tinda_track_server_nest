import { CustomersService } from './customers.service.js';
import { PullUtangRecordsQueryDto, PushUtangRecordDto } from './dto/sync.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class UtangRecordsController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    push(user: AuthUser, body: PushUtangRecordDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullUtangRecordsQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
