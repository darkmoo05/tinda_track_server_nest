import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Transaction } from '@prisma/client';
import { OcrStatus, TransactionDirection, TransactionStatus, WalletProvider } from '@prisma/client';
import { ChargeService } from '../charge/charge.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { ReceiptOcrService } from './receipt-ocr.service.js';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chargeService: ChargeService,
    private readonly receiptOcrService: ReceiptOcrService,
  ) {}

  async create(dto: CreateTransactionDto, receiptFile?: Express.Multer.File): Promise<Transaction> {
    const ocrResult = receiptFile
      ? await this.receiptOcrService.extractAmount(receiptFile.path)
      : { amount: null, rawText: '', confidence: null, status: 'FAILED' as const };

    const resolvedAmount = ocrResult.amount ?? dto.amount ?? null;
    if (resolvedAmount === null || resolvedAmount <= 0) {
      throw new BadRequestException('A valid transaction amount is required');
    }

    const chargeRule = await this.chargeService.findApplicableCharge(resolvedAmount);
    const chargeAmount = chargeRule?.chargeAmount ?? 0;

    const balanceBefore = await this.getWalletBalance(dto.walletProvider);
    const movement = this.buildMovement(dto.walletProvider, dto.direction, resolvedAmount, chargeAmount);
    const balanceAfter = balanceBefore + movement.walletBalanceDelta;
    const entryDate = dto.entryDate ?? new Date().toISOString();
    const reference = dto.reference?.trim() || this.buildReference(dto.walletProvider, dto.direction);

    return this.prisma.$transaction(async (client) => {
      const transaction = await client.transaction.create({
        data: {
          syncId: dto.syncId,
          deviceId: dto.deviceId,
          walletProvider: dto.walletProvider,
          direction: dto.direction,
          amount: resolvedAmount,
          chargeAmount,
          totalAmount: resolvedAmount + chargeAmount,
          balanceBefore,
          balanceAfter,
          chargeLowerBound: chargeRule?.lowerBound ?? null,
          chargeUpperBound: chargeRule?.upperBound ?? null,
          receiptImagePath: receiptFile?.path,
          receiptOriginalName: receiptFile?.originalname,
          receiptMimeType: receiptFile?.mimetype,
          receiptUploadedAt: receiptFile ? new Date() : null,
          ocrStatus: receiptFile ? (ocrResult.status === 'COMPLETED' ? OcrStatus.COMPLETED : OcrStatus.FAILED) : OcrStatus.PENDING,
          ocrExtractedAmount: ocrResult.amount,
          ocrRawText: ocrResult.rawText || null,
          ocrProcessedAt: receiptFile ? new Date() : null,
          note: dto.note ?? '',
          reference,
          entryDate,
          status: TransactionStatus.COMPLETED,
        },
      });

      await client.ledgerEntry.create({
        data: {
          syncId: `${transaction.id}-ledger-${randomUUID()}`,
          transactionId: transaction.id,
          deviceId: dto.deviceId ?? 'server',
          entryType: 'E_WALLET_TRANSACTION',
          title: `${dto.walletProvider} ${dto.direction === TransactionDirection.CASH_IN ? 'Cash In' : 'Cash Out'}`,
          note: dto.note ?? '',
          reference,
          amount: resolvedAmount,
          walletDelta: movement.walletDelta,
          mayaWalletDelta: movement.mayaWalletDelta,
          onHandDelta: movement.onHandDelta,
          recordedFlow: resolvedAmount,
          tag: 'transaction',
          iconKey: dto.walletProvider === WalletProvider.GCASH ? 'wallet_gcash' : 'wallet_maya',
          walletAccount: dto.walletProvider,
          ownerScope: 'Business',
          entryDate,
          isDeleted: false,
        },
      });

      return transaction;
    });
  }

  async list(query: ListTransactionsQueryDto): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        ...(query.walletProvider ? { walletProvider: query.walletProvider } : {}),
        ...(query.direction ? { direction: query.direction } : {}),
        ...(query.status ? { status: query.status as TransactionStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 20,
    });
  }

  private async getWalletBalance(walletProvider: WalletProvider): Promise<number> {
    const sums = await this.prisma.ledgerEntry.aggregate({
      where: { isDeleted: false },
      _sum: {
        walletDelta: true,
        mayaWalletDelta: true,
      },
    });

    return walletProvider === WalletProvider.GCASH
      ? (sums._sum.walletDelta ?? 0)
      : (sums._sum.mayaWalletDelta ?? 0);
  }

  private buildMovement(
    walletProvider: WalletProvider,
    direction: TransactionDirection,
    amount: number,
    chargeAmount: number,
  ): {
    walletBalanceDelta: number;
    walletDelta: number;
    mayaWalletDelta: number;
    onHandDelta: number;
  } {
    const isCashIn = direction === TransactionDirection.CASH_IN;
    const walletBalanceDelta = isCashIn ? -amount : amount + chargeAmount;
    const onHandDelta = isCashIn ? amount + chargeAmount : -amount;

    return {
      walletBalanceDelta,
      walletDelta: walletProvider === WalletProvider.GCASH ? walletBalanceDelta : 0,
      mayaWalletDelta: walletProvider === WalletProvider.MAYA ? walletBalanceDelta : 0,
      onHandDelta,
    };
  }

  private buildReference(walletProvider: WalletProvider, direction: TransactionDirection): string {
    const suffix = randomUUID().slice(0, 8).toUpperCase();
    const provider = walletProvider === WalletProvider.GCASH ? 'GC' : 'MY';
    const flow = direction === TransactionDirection.CASH_IN ? 'CI' : 'CO';
    return `${provider}-${flow}-${suffix}`;
  }
}
