import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { AddUtangDto, RecordPaymentDto } from './dto/utang.dto.js';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    list(): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
    create(body: CreateCustomerDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    addUtang(id: string, body: AddUtangDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    recordPayment(id: string, body: RecordPaymentDto): Promise<{
        success: boolean;
        data: unknown;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
}
