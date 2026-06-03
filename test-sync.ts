import { PrismaService } from './src/prisma/prisma.service.js';
import { SyncService } from './src/modules/sync/sync.service.js';
import { ConfigService } from '@nestjs/config';

async function run() {
  const config = new ConfigService({
    DATABASE_URL: 'postgresql://postgres:DarkMoon@localhost:5432/tinda_track?schema=public'
  });
  const prisma = new PrismaService(config);
  const syncService = new SyncService(prisma);

  // Initialize prisma
  await prisma.onModuleInit();

  // Get or seed a user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in the database. Please run migrations/seed or register a user first.');
    await prisma.onModuleDestroy();
    return;
  }
  const userId = user.id;
  console.log(`Using userId: ${userId}`);

  const pushPayload = {
    transactions: [
      {
        id: "test-txn-12345",
        syncId: "test-sync-12345",
        deviceId: "test-device",
        walletProvider: "GCASH",
        direction: "CASH_IN",
        amount: 100,
        chargeAmount: 5,
        totalAmount: 105,
        balanceBefore: 1000,
        balanceAfter: 900,
        entryDate: new Date().toISOString(),
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };

  try {
    const result = await syncService.pushAndPull(
      "test-device",
      userId,
      undefined,
      pushPayload as any
    );
    console.log('Sync succeeded:', result);
  } catch (error) {
    console.error('Sync failed with error:', error);
  } finally {
    await prisma.onModuleDestroy();
  }
}

run();
