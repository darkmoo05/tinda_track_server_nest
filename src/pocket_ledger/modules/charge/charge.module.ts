import { Module } from '@nestjs/common';
import { ChargeController } from './charge.controller';
import { ChargeService } from './charge.service';

@Module({
  controllers: [ChargeController],
  providers: [ChargeService],
  // Export ChargeService so other modules (e.g. LedgerEntry) can apply
  // charge rules without duplicating logic.
  exports: [ChargeService],
})
export class ChargeModule {}
