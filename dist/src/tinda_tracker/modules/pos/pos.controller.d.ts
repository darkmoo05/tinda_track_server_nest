import { CheckoutPosDto } from './dto/checkout-pos.dto.js';
import { ListSalesQueryDto } from './dto/list-sales-query.dto.js';
import { PosService } from './pos.service.js';
export declare class PosController {
    private readonly posService;
    constructor(posService: PosService);
    checkout(body: CheckoutPosDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    listSales(query: ListSalesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    getDashboard(): Promise<{
        success: boolean;
        data: unknown;
    }>;
    getReports(query: ListSalesQueryDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
