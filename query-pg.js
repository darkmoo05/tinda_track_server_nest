import { PrismaService } from './dist/src/prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';

async function main() {
  const config = new ConfigService({
    DATABASE_URL: 'postgresql://postgres:DarkMoon@localhost:5432/tinda_track?schema=public'
  });
  const prisma = new PrismaService(config);
  await prisma.onModuleInit();

  try {
    const users = await prisma.user.findMany();
    console.log('=== Users ===', JSON.stringify(users, null, 2));

    const userCount = await prisma.user.count();
    const transactionCount = await prisma.transaction.count();
    const ledgerEntryCount = await prisma.ledgerEntry.count();
    const feeTransactionCount = await prisma.feeTransaction.count();
    
    console.log('=== PG DB Summary ===');
    console.log(`Users: ${userCount}`);
    console.log(`Transactions: ${transactionCount}`);
    console.log(`Ledger Entries: ${ledgerEntryCount}`);
    console.log(`Fee Transactions: ${feeTransactionCount}`);

    const txs = await prisma.transaction.findMany({ take: 5 });
    console.log('=== Sample Transactions ===', JSON.stringify(txs, null, 2));

    const entries = await prisma.ledgerEntry.findMany({ take: 5 });
    console.log('=== Sample Ledger Entries ===', JSON.stringify(entries, null, 2));

    const fees = await prisma.feeTransaction.findMany({ take: 5 });
    console.log('=== Sample Fee Transactions ===', JSON.stringify(fees, null, 2));

  } catch (error) {
    console.error('Error querying DB:', error);
  } finally {
    await prisma.onModuleDestroy();
  }
}

main();
