import { MovementCategoryService } from './movement-category.service.js';
import { MovementCategoryItemDto } from './dto/movement-category-item.dto.js';
import { PullMovementCategoriesQueryDto } from './dto/pull-movement-categories-query.dto.js';
export declare class MovementCategoryController {
    private readonly movementCategoryService;
    constructor(movementCategoryService: MovementCategoryService);
    push(body: MovementCategoryItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(query: PullMovementCategoriesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
