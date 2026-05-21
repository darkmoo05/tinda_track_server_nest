import type { Customer, UtangRecord } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { AddUtangDto, RecordPaymentDto } from './dto/utang.dto.js';
export interface CustomerWithBalance extends Customer {
    balance: number;
    utangRecords: UtangRecord[];
}
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<CustomerWithBalance[]>;
    findOne(id: string): Promise<CustomerWithBalance>;
    create(dto: CreateCustomerDto): Promise<Customer>;
    addUtang(customerId: string, dto: AddUtangDto): Promise<UtangRecord>;
    recordPayment(customerId: string, dto: RecordPaymentDto): Promise<UtangRecord>;
    remove(id: string): Promise<Customer>;
    private ensureCustomerExists;
}
