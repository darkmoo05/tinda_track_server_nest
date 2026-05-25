import type { Sale } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CheckoutPosDto } from './dto/checkout-pos.dto.js';
import { ListSalesQueryDto } from './dto/list-sales-query.dto.js';
export declare class PosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkout(dto: CheckoutPosDto): Promise<Sale>;
    listSales(query: ListSalesQueryDto): Promise<({
        saleItems: ({
            product: {
                id: string;
                syncId: string | null;
                name: string;
                description: string;
                isDeleted: boolean;
                createdAt: Date;
                updatedAt: Date;
                imageUrl: string | null;
                shelfLocation: string | null;
                deviceId: string | null;
                expirationDate: Date | null;
                costPrice: number;
                sellingPrice: number;
                sku: string;
                category: string;
                baseUnit: string;
                stockInBaseUnit: number;
                reorderPoint: number;
                isActive: boolean;
                categoryId: string | null;
                shelfLocationId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            selectedUnit: string;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            computedBaseQuantity: number;
            saleId: string;
            lineTotal: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        note: string;
        reference: string;
        totalAmount: number;
        paidAmount: number;
        subtotal: number;
        changeAmount: number;
        totalItems: number;
    })[]>;
    getDashboardStats(): Promise<{
        today: {
            totalSales: number;
            profit: number;
            transactions: number;
        };
        lowStockProducts: {
            id: string;
            name: string;
            sellingPrice: number;
            stockInBaseUnit: number;
            reorderPoint: number;
        }[];
        totalOutstandingUtang: number;
        topProductsThisWeek: {
            name: string;
            qty: number;
            revenue: number;
            productId: string;
        }[];
    }>;
    getReports(query: ListSalesQueryDto): Promise<{
        summary: {
            totalSales: number;
            totalProfit: number;
            totalTransactions: number;
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
}
