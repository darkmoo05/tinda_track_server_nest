"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const CATEGORIES = [
    { syncId: 'seed-cat-snacks', name: 'Snacks', description: 'Chips, biscuits, junk foods, candies', examples: 'Piattos, Chippy, Cream-O, V-Cut', isQuickAccess: true },
    { syncId: 'seed-cat-beverages', name: 'Beverages', description: 'Soft drinks, juices, water, tea, coffee', examples: 'Coke, Sprite, C2, Zesto, Wilkins', isQuickAccess: true },
    { syncId: 'seed-cat-canned', name: 'Canned Goods', description: 'Sardines, corned beef, meat loaf, fruit cocktail', examples: 'Ligo, Argentina, Purefoods, Del Monte', isQuickAccess: true },
    { syncId: 'seed-cat-noodles', name: 'Instant Noodles', description: 'Pancit canton, lucky me, cup noodles', examples: 'Lucky Me, Payless, Nissin', isQuickAccess: true },
    { syncId: 'seed-cat-condiments', name: 'Condiments', description: 'Soy sauce, vinegar, ketchup, fish sauce', examples: 'Silver Swan, Datu Puti, UFC, Mama Sita', isQuickAccess: true },
    { syncId: 'seed-cat-rice-grains', name: 'Rice & Grains', description: 'Rice, sugar, salt, flour by weight', examples: 'Sinandomeng, Dinorado, Brown sugar', isQuickAccess: true },
    { syncId: 'seed-cat-dairy', name: 'Dairy & Eggs', description: 'Milk, eggs, cheese, butter, yogurt', examples: 'Bear Brand, Alaska, Eden, Magnolia', isQuickAccess: true },
    { syncId: 'seed-cat-personal-care', name: 'Personal Care', description: 'Shampoo, soap, toothpaste, sachets', examples: 'Safeguard, Colgate, Palmolive, Sunsilk', isQuickAccess: true },
    { syncId: 'seed-cat-laundry', name: 'Laundry & Cleaning', description: 'Detergents, bleach, fabric conditioner', examples: 'Tide, Surf, Downy, Zonrox', isQuickAccess: true },
    { syncId: 'seed-cat-cigarettes', name: 'Cigarettes & Tobacco', description: 'Sticks and packs (age-restricted)', examples: 'Marlboro, Winston, Mighty', isQuickAccess: true },
    { syncId: 'seed-cat-bread-pastry', name: 'Bread & Pastries', description: 'Pandesal, sliced bread, cakes, pastries', examples: 'Gardenia, Julie\'s, Pandesal', isQuickAccess: false },
    { syncId: 'seed-cat-frozen', name: 'Frozen Foods', description: 'Hotdogs, longganisa, tocino, ice cream', examples: 'Purefoods Tender Juicy, Selecta', isQuickAccess: false },
    { syncId: 'seed-cat-cooking-oil', name: 'Cooking Oil & Lard', description: 'Vegetable oil, coconut oil, lard', examples: 'Baguio, Minola, Marca Leon', isQuickAccess: false },
    { syncId: 'seed-cat-spreads', name: 'Spreads & Sandwich', description: 'Mayonnaise, peanut butter, jam, sandwich spread', examples: 'Lady\'s Choice, Skippy, Magnolia', isQuickAccess: false },
    { syncId: 'seed-cat-baby-care', name: 'Baby Care', description: 'Diapers, milk, wipes, baby cologne', examples: 'EQ, Pampers, Bonna, Cherifer', isQuickAccess: false },
    { syncId: 'seed-cat-school-office', name: 'School & Office', description: 'Pen, paper, notebook, envelope', examples: 'Mongol, Pilot, intermediate paper', isQuickAccess: false },
    { syncId: 'seed-cat-medicine', name: 'OTC Medicine', description: 'Pain relievers, vitamins, cough drops', examples: 'Biogesic, Alaxan, Neozep, Strepsils', isQuickAccess: false },
    { syncId: 'seed-cat-household', name: 'Household Supplies', description: 'Light bulbs, batteries, candles, matches', examples: 'Eveready, Firefly, Lite-y', isQuickAccess: false },
    { syncId: 'seed-cat-kitchenware', name: 'Kitchenware', description: 'Spoons, plates, plastic cups, foil', examples: 'Coleman, Lock & Lock, foil rolls', isQuickAccess: false },
    { syncId: 'seed-cat-pet-supplies', name: 'Pet Supplies', description: 'Dog food, cat food, treats', examples: 'Pedigree, Whiskas, Top Breed', isQuickAccess: false },
    { syncId: 'seed-cat-load-prepaid', name: 'Mobile Load & Cards', description: 'Prepaid load, e-PINs, gaming cards', examples: 'Globe, Smart, TNT, Sun, Mobile Legends', isQuickAccess: false },
    { syncId: 'seed-cat-alcohol', name: 'Alcohol & Beer', description: 'Beer, gin, rhum, brandy (age-restricted)', examples: 'San Miguel, Red Horse, GSM, Tanduay', isQuickAccess: false },
    { syncId: 'seed-cat-misc', name: 'Miscellaneous', description: 'Other items that don\'t fit the standard categories', examples: 'Lighters, ice candy bags, plastic straws', isQuickAccess: false },
];
const SHELF_LOCATIONS = [
    { syncId: 'seed-loc-counter', name: 'Counter', description: 'Main checkout counter — impulse-buy zone', examples: 'Candies, mints, sachet shampoo, single sticks' },
    { syncId: 'seed-loc-front-window', name: 'Front Window', description: 'Window display visible from the street', examples: 'New arrivals, promo items, eye-catchers' },
    { syncId: 'seed-loc-shelf-a', name: 'Shelf A — Top', description: 'Top shelf on the left wall (above eye level)', examples: 'Light bulbs, batteries, slow-movers' },
    { syncId: 'seed-loc-shelf-b', name: 'Shelf B — Middle', description: 'Eye-level shelf on the left wall (best-sellers)', examples: 'Coffee 3-in-1, milk sachets, biscuits' },
    { syncId: 'seed-loc-shelf-c', name: 'Shelf C — Bottom', description: 'Bottom shelf on the left wall (bulky goods)', examples: 'Detergent powder, 1.5L sodas' },
    { syncId: 'seed-loc-shelf-d', name: 'Shelf D — Top', description: 'Top shelf on the right wall', examples: 'Personal care, cosmetics, cologne' },
    { syncId: 'seed-loc-shelf-e', name: 'Shelf E — Middle', description: 'Eye-level shelf on the right wall', examples: 'Canned sardines, corned beef, condensed milk' },
    { syncId: 'seed-loc-shelf-f', name: 'Shelf F — Bottom', description: 'Bottom shelf on the right wall', examples: 'Sacks of rice, cooking oil gallons' },
    { syncId: 'seed-loc-rice-area', name: 'Rice Area', description: 'Dedicated rice / grains corner with sacks and scoops', examples: 'Sinandomeng, Dinorado, brown sugar sacks' },
    { syncId: 'seed-loc-fridge', name: 'Refrigerator', description: 'Cold drinks and dairy fridge (visible front)', examples: 'Coke 1.5L, Wilkins water, Milo' },
    { syncId: 'seed-loc-freezer', name: 'Freezer', description: 'Chest freezer for frozen meats and ice cream', examples: 'Hotdogs, longganisa, Selecta ice cream' },
    { syncId: 'seed-loc-bread-rack', name: 'Bread Rack', description: 'Hanging or table rack for fresh bread and pastries', examples: 'Pandesal, sliced bread, polvoron' },
    { syncId: 'seed-loc-load-station', name: 'Load Station', description: 'Mobile load and prepaid cards area (behind counter)', examples: 'Smart/Globe load wallet, gaming cards' },
    { syncId: 'seed-loc-medicine-cabinet', name: 'Medicine Cabinet', description: 'Locked or elevated cabinet for OTC meds', examples: 'Biogesic, Alaxan FR, Neozep, Strepsils' },
    { syncId: 'seed-loc-cigarette-rack', name: 'Cigarette Rack', description: 'Behind-counter cigarette and tobacco rack', examples: 'Marlboro packs, Winston sticks' },
    { syncId: 'seed-loc-alcohol-shelf', name: 'Alcohol Shelf', description: 'Liquor shelf above counter (age-restricted)', examples: 'Red Horse, Tanduay, Emperador' },
    { syncId: 'seed-loc-stockroom', name: 'Stockroom', description: 'Back room for overstock and bulk supply', examples: 'Boxes of biscuits, sacks, refill stocks' },
    { syncId: 'seed-loc-hanging-display', name: 'Hanging Display', description: 'Sachet strips hanging from the ceiling or grill', examples: 'Sunsilk sachets, instant coffee strips, candy strips' },
    { syncId: 'seed-loc-storefront-table', name: 'Storefront Table', description: 'Table just outside the window for produce / promos', examples: 'Bananas, garlic, onions, eggs by tray' },
];
async function main() {
    console.log('[seed] Upserting product categories…');
    for (const c of CATEGORIES) {
        await prisma.productCategory.upsert({
            where: { syncId: c.syncId },
            create: c,
            update: c,
        });
    }
    console.log(`[seed]   ${CATEGORIES.length} categories OK (${CATEGORIES.filter((c) => c.isQuickAccess).length} pinned)`);
    console.log('[seed] Upserting shelf locations…');
    for (const l of SHELF_LOCATIONS) {
        await prisma.shelfLocation.upsert({
            where: { syncId: l.syncId },
            create: l,
            update: { name: l.name, description: l.description, examples: l.examples },
        });
    }
    console.log(`[seed]   ${SHELF_LOCATIONS.length} shelf locations OK`);
}
main()
    .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map