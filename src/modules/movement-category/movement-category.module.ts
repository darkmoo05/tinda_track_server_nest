import { Module } from '@nestjs/common';
import { MovementCategoryController } from './movement-category.controller';
import { MovementCategoryService } from './movement-category.service';

@Module({
  controllers: [MovementCategoryController],
  providers: [MovementCategoryService],
  exports: [MovementCategoryService],
})
export class MovementCategoryModule {}
