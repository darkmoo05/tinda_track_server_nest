import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

export interface ReceiptOcrResult {
  amount: number | null;
  rawText: string;
  confidence: number | null;
  status: 'COMPLETED' | 'FAILED';
}

@Injectable()
export class ReceiptOcrService {
  private readonly logger = new Logger(ReceiptOcrService.name);

  async extractAmount(filePath: string): Promise<ReceiptOcrResult> {
    try {
      const worker = await createWorker('eng');
      const result = await worker.recognize(filePath);
      await worker.terminate();

      const rawText = result.data.text ?? '';
      const confidence = typeof result.data.confidence === 'number' ? result.data.confidence : null;
      const amount = this.pickBestAmount(rawText);

      return {
        amount,
        rawText,
        confidence,
        status: 'COMPLETED',
      };
    } catch (error) {
      this.logger.error(`OCR failed for ${filePath}`, error instanceof Error ? error.stack : String(error));
      return {
        amount: null,
        rawText: '',
        confidence: null,
        status: 'FAILED',
      };
    }
  }

  private pickBestAmount(rawText: string): number | null {
    const matches = [...rawText.matchAll(/(?:PHP|P|₱)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})|[0-9]+(?:\.[0-9]{1,2})?)/gi)];
    const candidates = matches
      .map((match) => Number.parseFloat(match[1].replace(/,/g, '')))
      .filter((value) => Number.isFinite(value) && value > 0 && value <= 1_000_000)
      .sort((left, right) => right - left);

    return candidates[0] ?? null;
  }
}
