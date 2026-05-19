import { Module } from '@nestjs/common';
import { ChargeModule } from '../charge/charge.module.js';
import { TransactionController } from './transaction.controller.js';
import { ReceiptOcrService } from './receipt-ocr.service.js';
import { TransactionService } from './transaction.service.js';

@Module({
  imports: [ChargeModule],
  controllers: [TransactionController],
  providers: [TransactionService, ReceiptOcrService],
})
export class TransactionModule {}
