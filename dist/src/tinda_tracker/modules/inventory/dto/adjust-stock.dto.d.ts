import { StockMovementType } from '@prisma/client';
export declare class AdjustStockDto {
    quantityDelta: number;
    movementType?: StockMovementType;
    note?: string;
    reference?: string;
    expirationDate?: string;
}
