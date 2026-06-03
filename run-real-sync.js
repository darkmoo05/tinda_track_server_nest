import { PrismaService } from './dist/src/prisma/prisma.service.js';
import { SyncService } from './dist/src/modules/sync/sync.service.js';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';

async function main() {
  const config = new ConfigService({
    DATABASE_URL: 'postgresql://postgres:DarkMoon@localhost:5432/tinda_track?schema=public'
  });
  const prisma = new PrismaService(config);
  const syncService = new SyncService(prisma);
  await prisma.onModuleInit();

  const userId = 'a58ac78f-c28e-4456-adc6-64e26e90ac56'; // user 'joje'
  const deviceId = 'test-device-123';

  // Load and format the payload
  const rawPayload = JSON.parse(fs.readFileSync('../sync_payload.json', 'utf8'));

  // Helper to convert numeric timestamps to ISO string
  function fixDates(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        fixDates(obj[key]);
      } else if ((key === 'createdAt' || key === 'updatedAt' || key === 'receiptUploadedAt' || key === 'ocrProcessedAt') && typeof obj[key] === 'number') {
        obj[key] = new Date(obj[key]).toISOString();
      }
    }
  }

  fixDates(rawPayload);

  console.log('Running pushAndPull with keys:', Object.keys(rawPayload));

  try {
    const result = await syncService.pushAndPull(
      deviceId,
      userId,
      undefined,
      rawPayload
    );
    console.log('Sync Succeeded! Result:', result);
  } catch (error) {
    console.error('SYNC EXCEPTION CAUGHT:', error);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.onModuleDestroy();
  }
}

main();
