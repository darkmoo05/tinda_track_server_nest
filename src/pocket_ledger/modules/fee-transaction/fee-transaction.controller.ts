import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FeeTransactionService } from './fee-transaction.service.js';
import { FeeTransactionItemDto } from './dto/fee-transaction-item.dto.js';
import { PullFeeTransactionsQueryDto } from './dto/pull-fee-transactions-query.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

/**
 * FeeTransactionController exposes the sync endpoints for fee records:
 *   POST /api/fee-transactions/push  — bulk-upsert from device
 *   GET  /api/fee-transactions/pull  — incremental pull since a timestamp
 */
@Controller('fee-transactions')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class FeeTransactionController {
  constructor(private readonly feeTransactionService: FeeTransactionService) {}

  /**
   * POST /api/fee-transactions/push
   *
   * Accepts an array of fee transaction objects. Returns { success, synced }.
   */
  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @CurrentUser() user: AuthUser,
    @Body(
      new ParseArrayPipe({ items: FeeTransactionItemDto, whitelist: true }),
    )
    body: FeeTransactionItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.feeTransactionService.push(user.id, body);
    return { success: true, synced };
  }

  /**
   * GET /api/fee-transactions/pull?since=<ms>&deviceId=<id>
   *
   * Returns fee transactions updated after `since` from other devices.
   */
  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullFeeTransactionsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.feeTransactionService.pull(user.id, query);
    return { success: true, data };
  }
}
