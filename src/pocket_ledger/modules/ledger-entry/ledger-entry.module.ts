import { Module } from '@nestjs/common';
import { LedgerEntryController } from './ledger-entry.controller';
import { LedgerEntryService } from './ledger-entry.service';

@Module({
  controllers: [LedgerEntryController],
  providers: [LedgerEntryService],
  exports: [LedgerEntryService],
})
export class LedgerEntryModule {}
