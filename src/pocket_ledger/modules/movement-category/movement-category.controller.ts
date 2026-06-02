import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { MovementCategoryService } from './movement-category.service.js';
import { MovementCategoryItemDto } from './dto/movement-category-item.dto.js';
import { PullMovementCategoriesQueryDto } from './dto/pull-movement-categories-query.dto.js';
import { Public } from '../../../modules/auth/decorators/public.decorator.js';

@Controller('movement-categories')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MovementCategoryController {
  constructor(private readonly movementCategoryService: MovementCategoryService) {}

  @Public()
  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @Body(new ParseArrayPipe({ items: MovementCategoryItemDto, whitelist: true })) body: MovementCategoryItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.movementCategoryService.push(body);
    return { success: true, synced };
  }

  @Public()
  @Get('pull')
  async pull(
    @Query() query: PullMovementCategoriesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.movementCategoryService.pull(query);
    return { success: true, data };
  }
}
