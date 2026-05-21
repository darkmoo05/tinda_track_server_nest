"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const categories_controller_js_1 = require("./categories.controller.js");
const inventory_controller_js_1 = require("./inventory.controller.js");
const inventory_service_js_1 = require("./inventory.service.js");
const shelf_locations_controller_js_1 = require("./shelf-locations.controller.js");
const local_storage_provider_js_1 = require("../../../core/storage/local-storage.provider.js");
const storage_provider_interface_js_1 = require("../../../core/storage/storage-provider.interface.js");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        controllers: [inventory_controller_js_1.InventoryController, categories_controller_js_1.CategoriesController, shelf_locations_controller_js_1.ShelfLocationsController],
        providers: [
            inventory_service_js_1.InventoryService,
            { provide: storage_provider_interface_js_1.STORAGE_PROVIDER, useClass: local_storage_provider_js_1.LocalStorageProvider },
        ],
        exports: [inventory_service_js_1.InventoryService],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map