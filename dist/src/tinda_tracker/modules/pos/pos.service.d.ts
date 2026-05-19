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
                name: string;
                id: string;
                syncId: string | null;
                deviceId: string | null;
                isDeleted: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                sku: string;
                category: string;
                unit: string;
                sellingPrice: number;
                costPrice: number;
                stockQuantity: number;
                reorderPoint: number;
                isActive: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            saleId: string;
            unitPrice: number;
            lineTotal: number;
        })[];
    } & {
        id: string;
        deviceId: string | null;
        createdAt: Date;
        updatedAt: Date;
        note: string;
        reference: string;
        totalAmount: number;
        paidAmount: number;
        subtotal: number;
        changeAmount: number;
        totalItems: number;
    })[]>;
    private buildReference;
}
