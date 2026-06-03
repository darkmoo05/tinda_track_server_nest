import { Body, Controller, Get, HttpCode, HttpStatus, ParseFilePipeBuilder, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { TransactionDirection, WalletProvider } from '@prisma/client';
import { CreateManualTransactionDto, CreateTransactionDto } from './dto/create-transaction.dto.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { TransactionPreviewQueryDto, TransactionPreviewResponseDto } from './dto/transaction-preview.dto.js';
import { receiptFileFilter, receiptStorage } from './receipt-upload.storage.js';
import { TransactionService } from './transaction.service.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.transactionService.list(user.id, query);
    return { success: true, data };
  }

  @Get('preview')
  async preview(
    @CurrentUser() user: AuthUser,
    @Query() query: TransactionPreviewQueryDto,
  ): Promise<{ success: boolean; data: TransactionPreviewResponseDto }> {
    const data = await this.transactionService.preview(
      user.id,
      query.walletProvider,
      query.direction,
      query.amount,
      (query.chargeHandling as 'addOnTop' | 'deductFromAmount') ?? 'addOnTop',
      query.transactionTypeKey,
    );
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createManual(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateManualTransactionDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.transactionService.create(user.id, body);
    return { success: true, data };
  }

  @Throttle({ ocr: { limit: 5, ttl: 60000 } })
  @Post('receipt')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: receiptStorage,
      fileFilter: receiptFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createFromReceipt(
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i })
        .build({ fileIsRequired: true }),
    )
    receipt: Express.Multer.File,
    @Body() body: CreateTransactionDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.transactionService.create(user.id, body, receipt);
    return { success: true, data };
  }
}

