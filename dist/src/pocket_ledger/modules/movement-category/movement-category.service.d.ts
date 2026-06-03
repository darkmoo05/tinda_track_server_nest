import type { MovementCategory } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { MovementCategoryItemDto } from './dto/movement-category-item.dto.js';
import { PullMovementCategoriesQueryDto } from './dto/pull-movement-categories-query.dto.js';
export declare class MovementCategoryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    push(userId: string, records: MovementCategoryItemDto[]): Promise<number>;
    pull(userId: string, query: PullMovementCategoriesQueryDto): Promise<MovementCategory[]>;
}
