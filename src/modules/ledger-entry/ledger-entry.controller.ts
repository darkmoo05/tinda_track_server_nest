import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { LedgerEntryService } from './ledger-entry.service';
import { LedgerEntryItemDto } from './dto/ledger-entry-item.dto.js';
import { PullLedgerEntriesQueryDto } from './dto/pull-ledger-entries-query.dto.js';

@Controller('entries')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class LedgerEntryController {
  constructor(private readonly ledgerEntryService: LedgerEntryService) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @Body(new ParseArrayPipe({ items: LedgerEntryItemDto, whitelist: true })) body: LedgerEntryItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.ledgerEntryService.push(body);
    return { success: true, synced };
  }

  @Get('pull')
  async pull(
    @Query() query: PullLedgerEntriesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.ledgerEntryService.pull(query);
    return { success: true, data };
  }
}
