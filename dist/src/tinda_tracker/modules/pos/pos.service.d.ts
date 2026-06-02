import type { Sale } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CheckoutPosDto } from './dto/checkout-pos.dto.js';
import { ListSalesQueryDto } from './dto/list-sales-query.dto.js';
import { PullSalesQueryDto, PushSaleDto } from './dto/push-sales.dto.js';
export declare class PosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkout(dto: CheckoutPosDto): Promise<Sale>;
    listSales(query: ListSalesQueryDto): Promise<any>;
    getDashboardStats(): Promise<{
        today: {
            totalSales: any;
            profit: any;
            transactions: any;
        };
        lowStockProducts: any;
        totalOutstandingUtang: any;
        topProductsThisWeek: {
            name: string;
            qty: number;
            revenue: number;
            productId: string;
        }[];
    }>;
    getReports(query: ListSalesQueryDto): Promise<{
        summary: {
            totalSales: any;
            totalProfit: any;
            totalTransactions: any;
        };
        daily: {
            date: string;
            sales: number;
            profit: number;
            transactions: number;
        }[];
        topProducts: {
            name: string;
            qty: number;
            revenue: number;
            productId: string;
        }[];
    }>;
    private buildReference;
    pushSales(records: PushSaleDto[]): Promise<number>;
    pullSales(query: PullSalesQueryDto): Promise<any>;
}
