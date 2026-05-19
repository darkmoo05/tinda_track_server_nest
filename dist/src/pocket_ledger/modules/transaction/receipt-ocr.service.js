"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ReceiptOcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptOcrService = void 0;
const common_1 = require("@nestjs/common");
const tesseract_js_1 = require("tesseract.js");
let ReceiptOcrService = ReceiptOcrService_1 = class ReceiptOcrService {
    logger = new common_1.Logger(ReceiptOcrService_1.name);
    async extractAmount(filePath) {
        try {
            const worker = await (0, tesseract_js_1.createWorker)('eng');
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
        }
        catch (error) {
            this.logger.error(`OCR failed for ${filePath}`, error instanceof Error ? error.stack : String(error));
            return {
                amount: null,
                rawText: '',
                confidence: null,
                status: 'FAILED',
            };
        }
    }
    pickBestAmount(rawText) {
        const matches = [...rawText.matchAll(/(?:PHP|P|₱)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})|[0-9]+(?:\.[0-9]{1,2})?)/gi)];
        const candidates = matches
            .map((match) => Number.parseFloat(match[1].replace(/,/g, '')))
            .filter((value) => Number.isFinite(value) && value > 0 && value <= 1_000_000)
            .sort((left, right) => right - left);
        return candidates[0] ?? null;
    }
};
exports.ReceiptOcrService = ReceiptOcrService;
exports.ReceiptOcrService = ReceiptOcrService = ReceiptOcrService_1 = __decorate([
    (0, common_1.Injectable)()
], ReceiptOcrService);
//# sourceMappingURL=receipt-ocr.service.js.map