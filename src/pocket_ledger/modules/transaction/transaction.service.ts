import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Transaction } from '@prisma/client';
import { OcrStatus, TransactionDirection, TransactionStatus, WalletProvider } from '@prisma/client';
import { ChargeService } from '../charge/charge.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
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

  async create(userId: string, dto: CreateTransactionDto, receiptFile?: Express.Multer.File): Promise<Transaction> {
    const ocrResult = receiptFile
      ? await this.receiptOcrService.extractAmount(receiptFile.path)
      : { amount: null, rawText: '', confidence: null, status: 'FAILED' as const };

    const resolvedAmount = ocrResult.amount ?? dto.amount ?? null;
    if (resolvedAmount === null || resolvedAmount <= 0) {
      throw new BadRequestException('A valid transaction amount is required');
    }

    // Check for duplicate syncId before entering transaction
    if (dto.syncId) {
      const existingTransaction = await this.prisma.transaction.findUnique({
        where: { syncId: dto.syncId },
      });
      if (existingTransaction) {
        throw new ConflictException('Transaction with this syncId already exists');
      }
    }

    const resolvedTypeKey =
      dto.transactionTypeKey ?? this.buildTransactionTypeKey(dto.walletProvider, dto.direction);
    const chargeRule = await this.chargeService.findApplicableCharge(
      userId,
      resolvedAmount,
      resolvedTypeKey,
    );
    const chargeAmount = chargeRule?.chargeAmount ?? 0;
    const chargeHandlingMode = dto.chargeHandling ?? 'addOnTop';
    const entryDate = dto.entryDate ?? new Date().toISOString();
    const reference = dto.reference?.trim() || this.buildReference(dto.walletProvider, dto.direction);

    return this.prisma.$transaction(async (client) => {
      // Compute balanceBefore inside transaction to prevent races
      const sums = await client.ledgerEntry.aggregate({
        where: { userId, isDeleted: false },
        _sum: {
          walletDelta: true,
          mayaWalletDelta: true,
        },
      });

      const balanceBefore =
        dto.walletProvider === WalletProvider.GCASH
          ? (sums._sum.walletDelta ?? 0)
          : (sums._sum.mayaWalletDelta ?? 0);

      const movement = this.buildMovement(
        dto.walletProvider,
        dto.direction,
        resolvedAmount,
        chargeAmount,
        chargeHandlingMode as 'addOnTop' | 'deductFromAmount',
        resolvedTypeKey,
      );

      const balanceAfter = balanceBefore + movement.walletBalanceDelta;

      // Validate that balance would not go negative
      if (balanceAfter < 0) {
        throw new BadRequestException(
          `Insufficient wallet balance. Current: ${balanceBefore}, requested: ${movement.walletBalanceDelta}, would result in: ${balanceAfter}`,
        );
      }

      const transaction = await client.transaction.create({
        data: {
          userId,
          syncId: dto.syncId,
          deviceId: dto.deviceId,
          walletProvider: dto.walletProvider,
          direction: dto.direction,
          amount: resolvedAmount,
          chargeAmount,
          chargeHandling: chargeHandlingMode,
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
          externalProvider: dto.externalProvider,
          externalTransactionId: dto.externalTransactionId,
          note: dto.note ?? '',
          reference,
          entryDate,
          status: TransactionStatus.COMPLETED,
        },
      });

      await client.ledgerEntry.create({
        data: {
          userId,
          syncId: `${transaction.id}-ledger-${randomUUID()}`,
          transactionId: transaction.id,
          deviceId: dto.deviceId ?? 'server',
          entryType: 'E_WALLET_TRANSACTION',
          title: resolvedTypeKey.includes('qrpayment')
            ? `${dto.walletProvider} QR Payment`
            : `${dto.walletProvider} ${dto.direction === TransactionDirection.CASH_IN ? 'Cash In' : 'Cash Out'}`,
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

  async list(userId: string, query: ListTransactionsQueryDto): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        ...(query.walletProvider ? { walletProvider: query.walletProvider } : {}),
        ...(query.direction ? { direction: query.direction } : {}),
        ...(query.status ? { status: query.status as TransactionStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 20,
    });
  }

  async preview(
    userId: string,
    walletProvider: WalletProvider,
    direction: TransactionDirection,
    amount: number,
    chargeHandling: 'addOnTop' | 'deductFromAmount' = 'addOnTop',
    transactionTypeKey?: string,
  ): Promise<{
    chargeAmount: number;
    totalCollected: number;
    walletCredit: number;
    onHandChange: number;
    feeRoutingExplanation: string;
    currentWalletBalance: number;
    postTransactionWalletBalance: number;
  }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const resolvedTypeKey =
      transactionTypeKey ?? this.buildTransactionTypeKey(walletProvider, direction);
    const chargeRule = await this.chargeService.findApplicableCharge(
      userId,
      amount,
      resolvedTypeKey,
    );
    const chargeAmount = chargeRule?.chargeAmount ?? 0;

    const movement = this.buildMovement(walletProvider, direction, amount, chargeAmount, chargeHandling, resolvedTypeKey);
    const currentWalletBalance = await this.getWalletBalance(userId, walletProvider);
    const postTransactionWalletBalance = currentWalletBalance + movement.walletBalanceDelta;

    let feeRoutingExplanation: string;
    if (resolvedTypeKey.includes('qrpayment')) {
      feeRoutingExplanation = `QR Payment (Top-up): customer sends ₱${(amount + chargeAmount).toFixed(2)} via QR (₱${amount.toFixed(2)} + ₱${chargeAmount.toFixed(2)} service fee). Business wallet increases by ₱${(amount + chargeAmount).toFixed(2)}, no cash exchange.`;
    } else if (direction === TransactionDirection.CASH_IN) {
      feeRoutingExplanation =
        chargeHandling === 'addOnTop'
          ? `Inflow: customer pays ₱${amount.toFixed(2)} + ₱${chargeAmount.toFixed(2)} in cash. Business wallet decreases by ₱${amount.toFixed(2)} and on-hand increases by ₱${(amount + chargeAmount).toFixed(2)}.`
          : `Inflow: customer pays ₱${amount.toFixed(2)} cash. Business wallet decreases by ₱${(amount - chargeAmount).toFixed(2)} (fee deducted from wallet transfer) and on-hand increases by ₱${amount.toFixed(2)}.`;
    } else {
      feeRoutingExplanation =
        chargeHandling === 'addOnTop'
          ? `Outflow: customer's wallet is charged ₱${amount.toFixed(2)} + ₱${chargeAmount.toFixed(2)}. Business wallet increases by ₱${(amount + chargeAmount).toFixed(2)} and on-hand decreases by ₱${amount.toFixed(2)}.`
          : `Outflow: customer's wallet is charged ₱${amount.toFixed(2)}. Business wallet increases by ₱${amount.toFixed(2)} and on-hand decreases by ₱${(amount - chargeAmount).toFixed(2)} (fee deducted from cash payout).`;
    }

    return {
      chargeAmount,
      totalCollected: amount + chargeAmount,
      walletCredit: movement.walletBalanceDelta,
      onHandChange: movement.onHandDelta,
      feeRoutingExplanation,
      currentWalletBalance,
      postTransactionWalletBalance,
    };
  }

  private buildTransactionTypeKey(walletProvider: WalletProvider, direction: TransactionDirection): string {
    const wallet = walletProvider === WalletProvider.GCASH ? 'gcash' : 'maya';
    const dir = direction === TransactionDirection.CASH_IN ? 'cashin' : 'cashout';
    return `${wallet}_${dir}`;
  }

  private async getWalletBalance(userId: string, walletProvider: WalletProvider): Promise<number> {
    const sums = await this.prisma.ledgerEntry.aggregate({
      where: { userId, isDeleted: false },
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
    chargeHandlingMode: 'addOnTop' | 'deductFromAmount' = 'addOnTop',
    transactionTypeKey?: string,
  ): {
    walletBalanceDelta: number;
    walletDelta: number;
    mayaWalletDelta: number;
    onHandDelta: number;
  } {
    let walletBalanceDelta: number;
    let onHandDelta: number;

    if (transactionTypeKey?.includes('qrpayment')) {
      // QR Payment (Top-up): customer pays amount + fee digitally via QR scan.
      // Store wallet increases by the full amount received; no cash exchange.
      walletBalanceDelta = amount + chargeAmount;
      onHandDelta = 0;
    } else if (direction === TransactionDirection.CASH_IN) {
      // Inflow: customer gives cash → ALL cash goes to on-hand; store sends e-money from wallet to customer.
      // wallet decreases (store loads customer), on-hand increases (store received cash + fee)
      if (chargeHandlingMode === 'addOnTop') {
        // Customer pays amount + fee in cash.
        // Store sends amount from wallet to customer. Store pockets amount + fee in on-hand.
        walletBalanceDelta = -amount;
        onHandDelta = amount + chargeAmount;
      } else {
        // Customer pays amount in cash. Fee deducted from what store sends to customer's wallet.
        // Store sends (amount - fee) from wallet to customer. Store pockets full amount in on-hand.
        walletBalanceDelta = -(amount - chargeAmount);
        onHandDelta = amount;
      }
    } else {
      // Outflow: customer's e-wallet is charged → ALL wallet movement goes to store wallet; store gives cash.
      // wallet increases (store receives e-money), on-hand decreases (store pays out cash)
      if (chargeHandlingMode === 'addOnTop') {
        // Customer's wallet charged amount + fee. Store receives all of it in wallet. Pays out amount in cash.
        walletBalanceDelta = amount + chargeAmount;
        onHandDelta = -amount;
      } else {
        // Customer's wallet charged amount. Store receives all of it in wallet. Pays out (amount - fee) in cash.
        walletBalanceDelta = amount;
        onHandDelta = -(amount - chargeAmount);
      }
    }

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
