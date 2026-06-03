"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_js_1 = require("./src/prisma/prisma.service.js");
const sync_service_js_1 = require("./src/modules/sync/sync.service.js");
const config_1 = require("@nestjs/config");
async function run() {
    const config = new config_1.ConfigService({
        DATABASE_URL: 'postgresql://postgres:DarkMoon@localhost:5432/tinda_track?schema=public'
    });
    const prisma = new prisma_service_js_1.PrismaService(config);
    const syncService = new sync_service_js_1.SyncService(prisma);
    await prisma.onModuleInit();
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
        const result = await syncService.pushAndPull("test-device", userId, undefined, pushPayload);
        console.log('Sync succeeded:', result);
    }
    catch (error) {
        console.error('Sync failed with error:', error);
    }
    finally {
        await prisma.onModuleDestroy();
    }
}
run();
//# sourceMappingURL=test-sync.js.map