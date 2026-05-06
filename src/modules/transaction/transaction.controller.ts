import { Body, Controller, Get, HttpCode, HttpStatus, ParseFilePipeBuilder, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionDirection, WalletProvider } from '@prisma/client';
import { CreateManualTransactionDto, CreateTransactionDto } from './dto/create-transaction.dto.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { TransactionPreviewQueryDto, TransactionPreviewResponseDto } from './dto/transaction-preview.dto.js';
import { receiptFileFilter, receiptStorage } from './receipt-upload.storage.js';
import { TransactionService } from './transaction.service.js';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async list(@Query() query: ListTransactionsQueryDto): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.transactionService.list(query);
    return { success: true, data };
  }

  @Get('preview')
  async preview(@Query() query: TransactionPreviewQueryDto): Promise<{ success: boolean; data: TransactionPreviewResponseDto }> {
    const data = await this.transactionService.preview(
      query.walletProvider,
      query.direction,
      query.amount,
      (query.chargeHandling as 'addOnTop' | 'deductFromAmount') ?? 'addOnTop',
    );
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createManual(
    @Body() body: CreateManualTransactionDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.transactionService.create(body);
    return { success: true, data };
  }

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
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i })
        .build({ fileIsRequired: true }),
    )
    receipt: Express.Multer.File,
    @Body() body: CreateTransactionDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.transactionService.create(body, receipt);
    return { success: true, data };
  }
}
