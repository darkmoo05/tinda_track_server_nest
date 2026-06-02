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
exports.MovementCategoryController = void 0;
const common_1 = require("@nestjs/common");
const movement_category_service_js_1 = require("./movement-category.service.js");
const movement_category_item_dto_js_1 = require("./dto/movement-category-item.dto.js");
const pull_movement_categories_query_dto_js_1 = require("./dto/pull-movement-categories-query.dto.js");
const public_decorator_js_1 = require("../../../modules/auth/decorators/public.decorator.js");
let MovementCategoryController = class MovementCategoryController {
    movementCategoryService;
    constructor(movementCategoryService) {
        this.movementCategoryService = movementCategoryService;
    }
    async push(body) {
        const synced = await this.movementCategoryService.push(body);
        return { success: true, synced };
    }
    async pull(query) {
        const data = await this.movementCategoryService.pull(query);
        return { success: true, data };
    }
};
exports.MovementCategoryController = MovementCategoryController;
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Post)('push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: movement_category_item_dto_js_1.MovementCategoryItemDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], MovementCategoryController.prototype, "push", null);
__decorate([
    (0, public_decorator_js_1.Public)(),
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pull_movement_categories_query_dto_js_1.PullMovementCategoriesQueryDto]),
    __metadata("design:returntype", Promise)
], MovementCategoryController.prototype, "pull", null);
exports.MovementCategoryController = MovementCategoryController = __decorate([
    (0, common_1.Controller)('movement-categories'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [movement_category_service_js_1.MovementCategoryService])
], MovementCategoryController);
//# sourceMappingURL=movement-category.controller.js.map