"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const client_1 = require("@prisma/client");
const charge_service_js_1 = require("../charge/charge.service.js");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
const receipt_ocr_service_js_1 = require("./receipt-ocr.service.js");
let TransactionService = class TransactionService {
    prisma;
    chargeService;
    receiptOcrService;
    constructor(prisma, chargeService, receiptOcrService) {
        this.prisma = prisma;
        this.chargeService = chargeService;
        this.receiptOcrService = receiptOcrService;
    }
    async create(dto, receiptFile) {
        const ocrResult = receiptFile
            ? await this.receiptOcrService.extractAmount(receiptFile.path)
            : { amount: null, rawText: '', confidence: null, status: 'FAILED' };
        const resolvedAmount = ocrResult.amount ?? dto.amount ?? null;
        if (resolvedAmount === null || resolvedAmount <= 0) {
            throw new common_1.BadRequestException('A valid transaction amount is required');
        }
        if (dto.syncId) {
            const existingTransaction = await this.prisma.transaction.findUnique({
                where: { syncId: dto.syncId },
            });
            if (existingTransaction) {
                throw new common_1.ConflictException('Transaction with this syncId already exists');
            }
        }
        const chargeRule = await this.chargeService.findApplicableCharge(resolvedAmount);
        const chargeAmount = chargeRule?.chargeAmount ?? 0;
        const chargeHandlingMode = dto.chargeHandling ?? 'addOnTop';
        const entryDate = dto.entryDate ?? new Date().toISOString();
        const reference = dto.reference?.trim() || this.buildReference(dto.walletProvider, dto.direction);
        return this.prisma.$transaction(async (client) => {
            const sums = await client.ledgerEntry.aggregate({
                where: { isDeleted: false },
                _sum: {
                    walletDelta: true,
                    mayaWalletDelta: true,
                },
            });
            const balanceBefore = dto.walletProvider === client_1.WalletProvider.GCASH
                ? (sums._sum.walletDelta ?? 0)
                : (sums._sum.mayaWalletDelta ?? 0);
            const movement = this.buildMovement(dto.walletProvider, dto.direction, resolvedAmount, chargeAmount, chargeHandlingMode);
            const balanceAfter = balanceBefore + movement.walletBalanceDelta;
            if (balanceAfter < 0) {
                throw new common_1.BadRequestException(`Insufficient wallet balance. Current: ${balanceBefore}, requested: ${movement.walletBalanceDelta}, would result in: ${balanceAfter}`);
            }
            const transaction = await client.transaction.create({
                data: {
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
                    ocrStatus: receiptFile ? (ocrResult.status === 'COMPLETED' ? client_1.OcrStatus.COMPLETED : client_1.OcrStatus.FAILED) : client_1.OcrStatus.PENDING,
                    ocrExtractedAmount: ocrResult.amount,
                    ocrRawText: ocrResult.rawText || null,
                    ocrProcessedAt: receiptFile ? new Date() : null,
                    externalProvider: dto.externalProvider,
                    externalTransactionId: dto.externalTransactionId,
                    note: dto.note ?? '',
                    reference,
                    entryDate,
                    status: client_1.TransactionStatus.COMPLETED,
                },
            });
            await client.ledgerEntry.create({
                data: {
                    syncId: `${transaction.id}-ledger-${(0, node_crypto_1.randomUUID)()}`,
                    transactionId: transaction.id,
                    deviceId: dto.deviceId ?? 'server',
                    entryType: 'E_WALLET_TRANSACTION',
                    title: `${dto.walletProvider} ${dto.direction === client_1.TransactionDirection.CASH_IN ? 'Cash In' : 'Cash Out'}`,
                    note: dto.note ?? '',
                    reference,
                    amount: resolvedAmount,
                    walletDelta: movement.walletDelta,
                    mayaWalletDelta: movement.mayaWalletDelta,
                    onHandDelta: movement.onHandDelta,
                    recordedFlow: resolvedAmount,
                    tag: 'transaction',
                    iconKey: dto.walletProvider === client_1.WalletProvider.GCASH ? 'wallet_gcash' : 'wallet_maya',
                    walletAccount: dto.walletProvider,
                    ownerScope: 'Business',
                    entryDate,
                    isDeleted: false,
                },
            });
            return transaction;
        });
    }
    async list(query) {
        return this.prisma.transaction.findMany({
            where: {
                ...(query.walletProvider ? { walletProvider: query.walletProvider } : {}),
                ...(query.direction ? { direction: query.direction } : {}),
                ...(query.status ? { status: query.status } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: query.limit ?? 20,
        });
    }
    async preview(walletProvider, direction, amount, chargeHandling = 'addOnTop') {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        const chargeRule = await this.chargeService.findApplicableCharge(amount);
        const chargeAmount = chargeRule?.chargeAmount ?? 0;
        const movement = this.buildMovement(walletProvider, direction, amount, chargeAmount, chargeHandling);
        const currentWalletBalance = await this.getWalletBalance(walletProvider);
        const postTransactionWalletBalance = currentWalletBalance + movement.walletBalanceDelta;
        let feeRoutingExplanation;
        if (direction === client_1.TransactionDirection.CASH_IN) {
            feeRoutingExplanation =
                chargeHandling === 'addOnTop'
                    ? `Inflow: customer pays $${amount.toFixed(2)} + $${chargeAmount.toFixed(2)} in cash. Business wallet decreases by $${amount.toFixed(2)} and on-hand increases by $${(amount + chargeAmount).toFixed(2)}.`
                    : `Inflow: customer pays $${amount.toFixed(2)} cash. Business wallet decreases by $${(amount - chargeAmount).toFixed(2)} (fee deducted from wallet transfer) and on-hand increases by $${amount.toFixed(2)}.`;
        }
        else {
            feeRoutingExplanation =
                chargeHandling === 'addOnTop'
                    ? `Outflow: customer's wallet is charged $${amount.toFixed(2)} + $${chargeAmount.toFixed(2)}. Business wallet increases by $${(amount + chargeAmount).toFixed(2)} and on-hand decreases by $${amount.toFixed(2)}.`
                    : `Outflow: customer's wallet is charged $${amount.toFixed(2)}. Business wallet increases by $${amount.toFixed(2)} and on-hand decreases by $${(amount - chargeAmount).toFixed(2)} (fee deducted from cash payout).`;
        }
        return {
            chargeAmount,
            totalCollected: amount + chargeAmount,
            walletCredit: direction === client_1.TransactionDirection.CASH_IN ? -amount : amount,
            onHandChange: movement.onHandDelta,
            feeRoutingExplanation,
            currentWalletBalance,
            postTransactionWalletBalance,
        };
    }
    async getWalletBalance(walletProvider) {
        const sums = await this.prisma.ledgerEntry.aggregate({
            where: { isDeleted: false },
            _sum: {
                walletDelta: true,
                mayaWalletDelta: true,
            },
        });
        return walletProvider === client_1.WalletProvider.GCASH
            ? (sums._sum.walletDelta ?? 0)
            : (sums._sum.mayaWalletDelta ?? 0);
    }
    buildMovement(walletProvider, direction, amount, chargeAmount, chargeHandlingMode = 'addOnTop') {
        let walletBalanceDelta;
        let onHandDelta;
        if (direction === client_1.TransactionDirection.CASH_IN) {
            if (chargeHandlingMode === 'addOnTop') {
                walletBalanceDelta = -amount;
                onHandDelta = amount + chargeAmount;
            }
            else {
                walletBalanceDelta = -(amount - chargeAmount);
                onHandDelta = amount;
            }
        }
        else {
            if (chargeHandlingMode === 'addOnTop') {
                walletBalanceDelta = amount + chargeAmount;
                onHandDelta = -amount;
            }
            else {
                walletBalanceDelta = amount;
                onHandDelta = -(amount - chargeAmount);
            }
        }
        return {
            walletBalanceDelta,
            walletDelta: walletProvider === client_1.WalletProvider.GCASH ? walletBalanceDelta : 0,
            mayaWalletDelta: walletProvider === client_1.WalletProvider.MAYA ? walletBalanceDelta : 0,
            onHandDelta,
        };
    }
    buildReference(walletProvider, direction) {
        const suffix = (0, node_crypto_1.randomUUID)().slice(0, 8).toUpperCase();
        const provider = walletProvider === client_1.WalletProvider.GCASH ? 'GC' : 'MY';
        const flow = direction === client_1.TransactionDirection.CASH_IN ? 'CI' : 'CO';
        return `${provider}-${flow}-${suffix}`;
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        charge_service_js_1.ChargeService,
        receipt_ocr_service_js_1.ReceiptOcrService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map