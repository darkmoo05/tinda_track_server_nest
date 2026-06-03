import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TransactionDirection, TransactionStatus, WalletProvider, PrismaClient } from '@prisma/client';
import { TransactionController } from './transaction.controller.js';
import { TransactionService } from './transaction.service.js';
import { ChargeService } from '../charge/charge.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ReceiptOcrService } from './receipt-ocr.service.js';
import { ConfigService } from '@nestjs/config';

describe('TransactionController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(
              process.env.DATABASE_URL || 'postgresql://postgres:DarkMoon@localhost:5432/tinda_track?schema=public'
            ),
            get: jest.fn().mockReturnValue(undefined),
          },
        },
        {
          provide: ChargeService,
          useValue: {
            findApplicableCharge: jest.fn().mockResolvedValue({ chargeAmount: 50, lowerBound: 0, upperBound: 10000 }),
          },
        },
        {
          provide: ReceiptOcrService,
          useValue: {
            extractAmount: jest.fn().mockResolvedValue({ amount: null, rawText: '', confidence: null, status: 'FAILED' }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    transactionService = moduleFixture.get<TransactionService>(TransactionService);

    // Create the test user to satisfy foreign key constraints
    await prisma.user.upsert({
      where: { id: 'test-user-id' },
      update: {},
      create: {
        id: 'test-user-id',
        username: 'test-user',
        password: 'password',
        role: 'OWNER',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up transactions before each test
    await prisma.ledgerEntry.deleteMany({});
    await prisma.transaction.deleteMany({});

    // Seed a starting balance of 100,000 to prevent insufficient balance errors
    await prisma.ledgerEntry.create({
      data: {
        userId: 'test-user-id',
        syncId: 'initial-wallet-load-' + Math.random().toString(36).substring(7),
        deviceId: 'server',
        entryType: 'INITIAL_LOAD',
        title: 'Initial Wallet Load',
        amount: 100000,
        walletDelta: 100000,
        mayaWalletDelta: 100000,
        onHandDelta: 100000,
        entryDate: new Date().toISOString(),
      },
    });
  });

  describe('POST /transactions - Idempotency & Duplicate Handling', () => {
    it('should return 409 Conflict on duplicate syncId', async () => {
      const syncId = 'test-sync-id-1';
      const createDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 1000,
        syncId,
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      // First request should succeed
      const firstResponse = await request(app.getHttpServer())
        .post('/transactions')
        .send(createDto);

      if (firstResponse.status !== HttpStatus.CREATED) {
        console.error('firstResponse FAILED:', firstResponse.body);
      }
      expect(firstResponse.status).toBe(HttpStatus.CREATED);

      expect(firstResponse.body.data.syncId).toBe(syncId);

      // Second request with same syncId should return 409
      const secondResponse = await request(app.getHttpServer())
        .post('/transactions')
        .send(createDto);

      if (secondResponse.status !== HttpStatus.CONFLICT) {
        console.error('secondResponse FAILED:', secondResponse.body);
      }
      expect(secondResponse.status).toBe(HttpStatus.CONFLICT);

      expect(secondResponse.body.message).toContain('already exists');
    });

    it('should allow multiple transactions with different syncIds', async () => {
      const createDto1 = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 1000,
        syncId: 'sync-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const createDto2 = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 500,
        syncId: 'sync-2',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const response1 = await request(app.getHttpServer())
        .post('/transactions')
        .send(createDto1)
        .expect(HttpStatus.CREATED);

      const response2 = await request(app.getHttpServer())
        .post('/transactions')
        .send(createDto2)
        .expect(HttpStatus.CREATED);

      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });
  });

  describe('POST /transactions - Negative Balance Validation', () => {
    it('should return 400 when transaction would make wallet balance negative', async () => {
      // First, create a CASH_IN transaction that reduces wallet balance below 0.
      // The starting balance is 100,000, so a CASH_IN of 150,000 will fail.
      const cashInNegDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 150000,
        syncId: 'cash-in-neg-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      // This should fail because wallet starts at 100,000 and CASH_IN reduces it by 150,000
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(cashInNegDto);

      if (response.status !== HttpStatus.BAD_REQUEST) {
        console.error('negative balance test FAILED:', response.status, response.body);
      }
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Insufficient wallet balance');
    });

    it('should allow transaction if balance remains non-negative', async () => {
      // First load wallet via CASH_IN (reduces by 5000 -> 95,000 remaining)
      const cashInDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 5000,
        syncId: 'cash-in-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(cashInDto)
        .expect(HttpStatus.CREATED);

      // Now cash out part of it (increases balance by 3050)
      const cashOutDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_OUT,
        amount: 3000,
        syncId: 'cash-out-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(cashOutDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.data.balanceAfter).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /transactions - Balance Calculation Inside Transaction', () => {
    it('should calculate balanceBefore correctly inside transaction', async () => {
      // Create initial transaction
      const cashInDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 1000,
        syncId: 'balance-test-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(cashInDto)
        .expect(HttpStatus.CREATED);

      // Starting balance seeded in beforeEach is 100000.
      // CASH_IN of 1000 reduces wallet by 1000 -> 99000.
      expect(response.body.data.balanceBefore).toBe(100000);
      expect(response.body.data.balanceAfter).toBe(99000);

      // Create second transaction
      const cashInDto2 = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 500,
        syncId: 'balance-test-2',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const response2 = await request(app.getHttpServer())
        .post('/transactions')
        .send(cashInDto2)
        .expect(HttpStatus.CREATED);

      // balanceBefore should be 99000 (from first transaction)
      expect(response2.body.data.balanceBefore).toBe(99000);
      // CASH_IN of 500 reduces wallet by 500 -> 98500.
      expect(response2.body.data.balanceAfter).toBe(98500);
    });

    it('should maintain consistent balances across concurrent requests', async () => {
      // Create initial wallet load (CASH_IN of 10,000 reduces 100,000 -> 90,000)
      const initialDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 10000,
        syncId: 'initial-load',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(initialDto)
        .expect(HttpStatus.CREATED);

      // Simulate two concurrent transactions (both CASH_OUT, which increases store's wallet)
      // concurrent1: CASH_OUT of 2000 (wallet increases by 2000 + 50 = 2050)
      // concurrent2: CASH_OUT of 3000 (wallet increases by 3000 + 50 = 3050)
      const concurrent1 = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_OUT,
        amount: 2000,
        syncId: 'concurrent-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const concurrent2 = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_OUT,
        amount: 3000,
        syncId: 'concurrent-2',
        deviceId: 'device-2',
        chargeHandling: 'addOnTop',
      };

      // Execute concurrently
      const [response1, response2] = await Promise.all([
        request(app.getHttpServer())
          .post('/transactions')
          .send(concurrent1)
          .expect(HttpStatus.CREATED),
        request(app.getHttpServer())
          .post('/transactions')
          .send(concurrent2)
          .expect(HttpStatus.CREATED),
      ]);

      // Depending on transaction scheduling order, either response1 or response2 starts first.
      const bBefore1 = response1.body.data.balanceBefore;
      const bBefore2 = response2.body.data.balanceBefore;

      expect([90000, 93050]).toContain(bBefore1);
      expect([90000, 92050]).toContain(bBefore2);

      // One of the balanceBefore values must be 90,000 (the base starting balance)
      expect(Math.min(bBefore1, bBefore2)).toBe(90000);

      // Their balanceAfter values should reflect the increments:
      // concurrent1 balanceAfter: bBefore1 + 2050.
      // concurrent2 balanceAfter: bBefore2 + 3050.
      // The final balance after both have completed must be 95100.
      expect([92050, 95100]).toContain(response1.body.data.balanceAfter);
      expect([93050, 95100]).toContain(response2.body.data.balanceAfter);
      expect(Math.max(response1.body.data.balanceAfter, response2.body.data.balanceAfter)).toBe(95100);
    });
  });

  describe('POST /transactions - Fee Routing', () => {
    it('should respect chargeHandling field and apply correct movements', async () => {
      const addOnTopDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 1000,
        syncId: 'fee-test-add-on-top',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(addOnTopDto)
        .expect(HttpStatus.CREATED);

      // Verify chargeHandling is persisted
      expect(response.body.data.chargeHandling).toBe('addOnTop');

      // Verify the ledger entry has correct deltas
      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { transactionId: response.body.data.id },
      });

      expect(ledgerEntries.length).toBeGreaterThan(0);
      const entry = ledgerEntries[0];
      // CASH_IN addOnTop with fee=50: wallet decreases by 1000, cash increases by 1050 (1000 + 50 fee received)
      expect(entry.walletDelta).toBe(-1000);
      expect(entry.onHandDelta).toBe(1050);
    });

    it('should store external provider metadata', async () => {
      const externalDto = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 1000,
        syncId: 'external-test-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
        externalProvider: 'GCASH_OFFICIAL',
        externalTransactionId: 'gcash-txn-12345',
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(externalDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.data.externalProvider).toBe('GCASH_OFFICIAL');
      expect(response.body.data.externalTransactionId).toBe('gcash-txn-12345');
    });
  });

  describe('GET /transactions - Listing', () => {
    it('should list transactions with correct balances', async () => {
      // Create a few transactions
      const dto1 = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_IN,
        amount: 1000,
        syncId: 'list-test-1',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      const dto2 = {
        walletProvider: WalletProvider.GCASH,
        direction: TransactionDirection.CASH_OUT,
        amount: 500,
        syncId: 'list-test-2',
        deviceId: 'device-1',
        chargeHandling: 'addOnTop',
      };

      await request(app.getHttpServer())
        .post('/transactions')
        .send(dto1)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/transactions')
        .send(dto2)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/transactions')
        .query({ limit: 10 })
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
