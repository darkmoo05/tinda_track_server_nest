export interface ReceiptOcrResult {
    amount: number | null;
    rawText: string;
    confidence: number | null;
    status: 'COMPLETED' | 'FAILED';
}
export declare class ReceiptOcrService {
    private readonly logger;
    extractAmount(filePath: string): Promise<ReceiptOcrResult>;
    private pickBestAmount;
}
