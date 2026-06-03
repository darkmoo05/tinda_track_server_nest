import { MovementCategoryService } from './movement-category.service.js';
import { MovementCategoryItemDto } from './dto/movement-category-item.dto.js';
import { PullMovementCategoriesQueryDto } from './dto/pull-movement-categories-query.dto.js';
import { type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';
export declare class MovementCategoryController {
    private readonly movementCategoryService;
    constructor(movementCategoryService: MovementCategoryService);
    push(user: AuthUser, body: MovementCategoryItemDto[]): Promise<{
        success: boolean;
        synced: number;
    }>;
    pull(user: AuthUser, query: PullMovementCategoriesQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
