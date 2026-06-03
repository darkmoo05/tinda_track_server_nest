import { CheckoutPosDto } from './dto/checkout-pos.dto.js';
import { ListSalesQueryDto } from './dto/list-sales-query.dto.js';
import { PosService } from './pos.service.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class PosController {
    private readonly posService;
    constructor(posService: PosService);
    checkout(user: AuthUser, body: CheckoutPosDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    listSales(user: AuthUser, query: ListSalesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    getDashboard(user: AuthUser): Promise<{
        success: boolean;
        data: unknown;
    }>;
    getReports(user: AuthUser, query: ListSalesQueryDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
