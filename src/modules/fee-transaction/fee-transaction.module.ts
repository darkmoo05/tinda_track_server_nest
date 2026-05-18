import { Module } from '@nestjs/common';
import { FeeTransactionController } from './fee-transaction.controller';
import { FeeTransactionService } from './fee-transaction.service';

@Module({
  controllers: [FeeTransactionController],
  providers: [FeeTransactionService],
})
export class FeeTransactionModule {}
