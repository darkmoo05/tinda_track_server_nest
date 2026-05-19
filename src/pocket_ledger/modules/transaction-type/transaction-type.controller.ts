import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TransactionTypeService } from './transaction-type.service';
import { TransactionTypeItemDto } from './dto/transaction-type-item.dto.js';
import { PullTransactionTypesQueryDto } from './dto/pull-transaction-types-query.dto.js';

@Controller('transaction-types')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TransactionTypeController {
  constructor(private readonly transactionTypeService: TransactionTypeService) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @Body(new ParseArrayPipe({ items: TransactionTypeItemDto, whitelist: true })) body: TransactionTypeItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.transactionTypeService.push(body);
    return { success: true, synced };
  }

  @Get('pull')
  async pull(
    @Query() query: PullTransactionTypesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.transactionTypeService.pull(query);
    return { success: true, data };
  }
}
