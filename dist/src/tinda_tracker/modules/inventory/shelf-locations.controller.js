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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShelfLocationsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const node_path_1 = require("node:path");
const inventory_service_js_1 = require("./inventory.service.js");
const UPLOAD_DIR = './uploads/shelf-locations';
let ShelfLocationsController = class ShelfLocationsController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async list() {
        const data = await this.inventoryService.listShelfLocations();
        return { success: true, data };
    }
    async push(body) {
        const data = await this.inventoryService.pushShelfLocations(body);
        return { success: true, data };
    }
    async pull(since, _deviceId) {
        const sinceMs = parseInt(since ?? '0', 10);
        const data = await this.inventoryService.pullShelfLocations(sinceMs);
        return { success: true, data };
    }
    async uploadImage(id, file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const data = await this.inventoryService.updateShelfLocationImage(id, file);
        return { success: true, data };
    }
    async remove(id) {
        const data = await this.inventoryService.deleteShelfLocation(id);
        return { success: true, data };
    }
};
exports.ShelfLocationsController = ShelfLocationsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShelfLocationsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('push'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ShelfLocationsController.prototype, "push", null);
__decorate([
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)('since')),
    __param(1, (0, common_1.Query)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShelfLocationsController.prototype, "pull", null);
__decorate([
    (0, common_1.Patch)(':id/image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: UPLOAD_DIR,
            filename: (req, file, cb) => {
                const ext = (0, node_path_1.extname)(file.originalname).toLowerCase() || '.webp';
                cb(null, `${req.params['id']}-${Date.now()}${ext}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            if (/\/(jpg|jpeg|png|webp|gif)$/.test(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed'), false);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShelfLocationsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShelfLocationsController.prototype, "remove", null);
exports.ShelfLocationsController = ShelfLocationsController = __decorate([
    (0, common_1.Controller)('inventory/shelf-locations'),
    __metadata("design:paramtypes", [inventory_service_js_1.InventoryService])
], ShelfLocationsController);
//# sourceMappingURL=shelf-locations.controller.js.map