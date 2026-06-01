import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';
import { ProductUnitConversionsController } from './product-unit-conversions.controller.js';
import { ShelfLocationsController } from './shelf-locations.controller.js';
import { LocalStorageProvider } from '../../../core/storage/local-storage.provider.js';
import { STORAGE_PROVIDER } from '../../../core/storage/storage-provider.interface.js';

@Module({
  controllers: [
    InventoryController,
    CategoriesController,
    ShelfLocationsController,
    ProductUnitConversionsController,
  ],
  providers: [
    InventoryService,
    // Swap LocalStorageProvider for SpacesStorageProvider (or any IStorageProvider
    // implementation) when you are ready to move to DigitalOcean Spaces.
    { provide: STORAGE_PROVIDER, useClass: LocalStorageProvider },
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
