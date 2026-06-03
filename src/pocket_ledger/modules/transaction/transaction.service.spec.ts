import { Test, TestingModule } from '@nestjs/testing';
import { TransactionDirection, TransactionStatus, WalletProvider } from '@prisma/client';
import { ChargeService } from '../charge/charge.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TransactionService } from './transaction.service.js';
import { ReceiptOcrService } from './receipt-ocr.service.js';

describe('TransactionService - buildMovement', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ChargeService,
          useValue: {},
        },
        {
          provide: ReceiptOcrService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('Cash In (CASH_IN) - Inflow', () => {
    it('should put amount + fee into on-hand with addOnTop mode', () => {
      // Cash In: amount=1000, fee=50, addOnTop
      // Customer gives 1000 + 50 = 1050 cash.
      // Store sends 1000 from wallet to customer. On-hand gains 1050.
      // Expected: walletDelta = -1000, onHandDelta = +1050
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000,
        50,
        'addOnTop',
      );

      expect(result.walletDelta).toBe(-1000);
      expect(result.onHandDelta).toBe(1050);
      expect(result.mayaWalletDelta).toBe(0);
      expect(result.walletBalanceDelta).toBe(-1000);
    });

    it('should put full amount into on-hand with deductFromAmount mode', () => {
      // Cash In: amount=1000, fee=50, deductFromAmount
      // Customer gives 1000 cash. Fee deducted from wallet credit (store sends 950).
      // On-hand gains full 1000.
      // Expected: walletDelta = -950, onHandDelta = +1000
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000,
        50,
        'deductFromAmount',
      );

      expect(result.walletDelta).toBe(-950);
      expect(result.onHandDelta).toBe(1000);
      expect(result.mayaWalletDelta).toBe(0);
      expect(result.walletBalanceDelta).toBe(-950);
    });

    it('should handle zero fee in Cash In addOnTop', () => {
      // Cash In: amount=1000, fee=0, addOnTop
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000,
        0,
        'addOnTop',
      );

      expect(result.walletDelta).toBe(-1000);
      expect(result.onHandDelta).toBe(1000);
      expect(result.walletBalanceDelta).toBe(-1000);
    });

    it('should correctly handle Maya wallet for Cash In', () => {
      // Cash In with Maya wallet instead of GCash
      const result = service['buildMovement'](
        WalletProvider.MAYA,
        TransactionDirection.CASH_IN,
        1000,
        50,
        'addOnTop',
      );

      expect(result.mayaWalletDelta).toBe(-1000);
      expect(result.walletDelta).toBe(0);
      expect(result.onHandDelta).toBe(1050);
      expect(result.walletBalanceDelta).toBe(-1000);
    });
  });

  describe('Cash Out (CASH_OUT) - Outflow', () => {
    it('should put amount + fee into wallet with addOnTop mode', () => {
      // Cash Out: amount=1000, fee=50, addOnTop
      // Customer's wallet charged 1000 + 50. Store receives all in wallet. Pays 1000 cash.
      // Expected: walletDelta = +1050, onHandDelta = -1000
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_OUT,
        1000,
        50,
        'addOnTop',
      );

      expect(result.walletDelta).toBe(1050);
      expect(result.onHandDelta).toBe(-1000);
      expect(result.mayaWalletDelta).toBe(0);
      expect(result.walletBalanceDelta).toBe(1050);
    });

    it('should put full amount into wallet with deductFromAmount mode', () => {
      // Cash Out: amount=1000, fee=50, deductFromAmount
      // Customer's wallet charged 1000. Store receives all in wallet. Pays 950 cash.
      // Expected: walletDelta = +1000, onHandDelta = -950
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_OUT,
        1000,
        50,
        'deductFromAmount',
      );

      expect(result.walletDelta).toBe(1000);
      expect(result.onHandDelta).toBe(-950);
      expect(result.mayaWalletDelta).toBe(0);
      expect(result.walletBalanceDelta).toBe(1000);
    });

    it('should handle zero fee in Cash Out addOnTop', () => {
      // Cash Out: amount=1000, fee=0, addOnTop
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_OUT,
        1000,
        0,
        'addOnTop',
      );

      expect(result.walletDelta).toBe(1000);
      expect(result.onHandDelta).toBe(-1000);
      expect(result.walletBalanceDelta).toBe(1000);
    });

    it('should correctly handle Maya wallet for Cash Out', () => {
      // Cash Out with Maya wallet instead of GCash
      const result = service['buildMovement'](
        WalletProvider.MAYA,
        TransactionDirection.CASH_OUT,
        1000,
        50,
        'addOnTop',
      );

      expect(result.mayaWalletDelta).toBe(1050);
      expect(result.walletDelta).toBe(0);
      expect(result.onHandDelta).toBe(-1000);
      expect(result.walletBalanceDelta).toBe(1050);
    });
  });

  describe('Fee routing logic verification', () => {
    it('should always increase on-hand for Cash In (addOnTop)', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000,
        100,
        'addOnTop',
      );
      expect(result.onHandDelta).toBe(1100); // amount + fee
      expect(result.walletDelta).toBe(-1000); // wallet decreases
    });

    it('should always increase on-hand for Cash In (deductFromAmount)', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000,
        100,
        'deductFromAmount',
      );
      expect(result.onHandDelta).toBe(1000); // full amount paid by customer
      expect(result.walletDelta).toBe(-900);  // wallet decreases by amount - fee
    });

    it('should always increase wallet for Cash Out (addOnTop)', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_OUT,
        1000,
        100,
        'addOnTop',
      );
      expect(result.walletDelta).toBe(1100); // amount + fee
      expect(result.onHandDelta).toBe(-1000); // on-hand decreases
    });

    it('should always increase wallet for Cash Out (deductFromAmount)', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_OUT,
        1000,
        100,
        'deductFromAmount',
      );
      expect(result.walletDelta).toBe(1000); // full amount charged from customer wallet
      expect(result.onHandDelta).toBe(-900); // on-hand decreases by amount - fee
    });
  });

  describe('Edge cases', () => {
    it('should handle large amounts', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000000,
        50000,
        'addOnTop',
      );

      expect(result.walletDelta).toBe(-1000000);
      expect(result.onHandDelta).toBe(1050000);
    });

    it('should handle fractional amounts', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000.5,
        50.25,
        'addOnTop',
      );

      expect(result.walletDelta).toBe(-1000.5);
      expect(result.onHandDelta).toBeCloseTo(1050.75);
    });

    it('should maintain net-fee invariant for Cash In addOnTop', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_IN,
        1000,
        50,
        'addOnTop',
      );
      // walletDelta = -1000, onHandDelta = +1050
      // Net: -1000 + 1050 = +50 (store gains the fee) ✓
      const totalChange = result.walletDelta + result.onHandDelta;
      expect(totalChange).toBe(50);
    });

    it('should maintain net-fee invariant for Cash Out addOnTop', () => {
      const result = service['buildMovement'](
        WalletProvider.GCASH,
        TransactionDirection.CASH_OUT,
        1000,
        50,
        'addOnTop',
      );
      // walletDelta = +1050, onHandDelta = -1000
      // Net: +1050 - 1000 = +50 (store gains the fee) ✓
      const totalChange = result.walletDelta + result.onHandDelta;
      expect(totalChange).toBe(50);
    });
  });
});
