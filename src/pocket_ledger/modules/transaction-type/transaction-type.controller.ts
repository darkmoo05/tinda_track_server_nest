import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TransactionTypeService } from './transaction-type.service.js';
import { TransactionTypeItemDto } from './dto/transaction-type-item.dto.js';
import { PullTransactionTypesQueryDto } from './dto/pull-transaction-types-query.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('transaction-types')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TransactionTypeController {
  constructor(private readonly transactionTypeService: TransactionTypeService) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @CurrentUser() user: AuthUser,
    @Body(new ParseArrayPipe({ items: TransactionTypeItemDto, whitelist: true })) body: TransactionTypeItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.transactionTypeService.push(user.id, body);
    return { success: true, synced };
  }

  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullTransactionTypesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.transactionTypeService.pull(user.id, query);
    return { success: true, data };
  }
}
