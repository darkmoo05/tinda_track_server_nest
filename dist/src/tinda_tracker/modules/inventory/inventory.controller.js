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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const inventory_service_js_1 = require("./inventory.service.js");
const adjust_stock_dto_js_1 = require("./dto/adjust-stock.dto.js");
const create_product_dto_js_1 = require("./dto/create-product.dto.js");
const list_products_query_dto_js_1 = require("./dto/list-products-query.dto.js");
const update_product_dto_js_1 = require("./dto/update-product.dto.js");
const push_products_dto_js_1 = require("./dto/push-products.dto.js");
const public_decorator_js_1 = require("../../../modules/auth/decorators/public.decorator.js");
const UPLOAD_DIR = './uploads/products';
(0, node_fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async create(body) {
        const data = await this.inventoryService.create(body);
        return { success: true, data };
    }
    async list(query) {
        const data = await this.inventoryService.list(query);
        return { success: true, data };
    }
    async push(body) {
        const synced = await this.inventoryService.pushProducts(body);
        return { success: true, synced };
    }
    async pull(query) {
        const data = await this.inventoryService.pullProducts(query);
        return { success: true, data };
    }
    async update(id, body) {
        const data = await this.inventoryService.update(id, body);
        return { success: true, data };
    }
    async uploadImage(id, file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const data = await this.inventoryService.updateImage(id, file);
        return { success: true, data };
    }
    async adjustStock(id, body) {
        const data = await this.inventoryService.adjustStock(id, body);
        return { success: true, data };
    }
    async getMovements(id) {
        const data = await this.inventoryService.getMovements(id);
        return { success: true, data };
    }
    async remove(id) {
        const data = await this.inventoryService.remove(id);
        return { success: true, data };
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_js_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_products_query_dto_js_1.ListProductsQueryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "list", null);
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Post)('push'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "push", null);
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [push_products_dto_js_1.PullProductsQueryDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "pull", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_js_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "update", null);
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
], InventoryController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)(':id/adjust-stock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adjust_stock_dto_js_1.AdjustStockDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)(':id/movements'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "remove", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory/products'),
    __metadata("design:paramtypes", [inventory_service_js_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map