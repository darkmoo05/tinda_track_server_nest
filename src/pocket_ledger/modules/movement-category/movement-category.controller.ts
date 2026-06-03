import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MovementCategoryService } from './movement-category.service.js';
import { MovementCategoryItemDto } from './dto/movement-category-item.dto.js';
import { PullMovementCategoriesQueryDto } from './dto/pull-movement-categories-query.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('movement-categories')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MovementCategoryController {
  constructor(private readonly movementCategoryService: MovementCategoryService) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @CurrentUser() user: AuthUser,
    @Body(new ParseArrayPipe({ items: MovementCategoryItemDto, whitelist: true })) body: MovementCategoryItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.movementCategoryService.push(user.id, body);
    return { success: true, synced };
  }

  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullMovementCategoriesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.movementCategoryService.pull(user.id, query);
    return { success: true, data };
  }
}
