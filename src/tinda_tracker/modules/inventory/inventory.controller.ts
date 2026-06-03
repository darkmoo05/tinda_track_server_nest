import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { InventoryService } from './inventory.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import {
  PullProductsQueryDto,
  PushProductDto,
} from './dto/push-products.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

const UPLOAD_DIR = './uploads/products';
// Ensure the upload directory exists at module load time.
mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('inventory/products')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateProductDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.create(user.id, body);
    return { success: true, data };
  }

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListProductsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.list(user.id, query);
    return { success: true, data };
  }

  /** Bulk upsert from the Flutter sync service. */
  @Post('push')
  async push(
    @CurrentUser() user: AuthUser,
    @Body() body: PushProductDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.inventoryService.pushProducts(user.id, body);
    return { success: true, synced };
  }

  /** Pull — returns all products updated since [since] ms; excludes own deviceId. */
  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullProductsQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.pullProducts(user.id, query);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.update(user.id, id, body);
    return { success: true, data };
  }

  /**
   * Upload or replace a product's image.
   * Multer writes the raw file to `./uploads/products/` on disk;
   * the service derives the public URL and persists it to the DB.
   *
   * Client sends:  PATCH /api/inventory/products/:id/image
   *                Content-Type: multipart/form-data
   *                Field name  : "file"
   */
  @Patch(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
          // e.g. 550e8400-e29b-41d4-a716-446655440000-1716278400000.webp
          const ext = extname(file.originalname).toLowerCase() || '.webp';
          cb(null, `${req.params['id']}-${Date.now()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (/\/(jpg|jpeg|png|webp|gif)$/.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB hard cap
    }),
  )
  async uploadImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: unknown }> {
    if (!file) throw new BadRequestException('No file provided');
    const data = await this.inventoryService.updateImage(user.id, id, file);
    return { success: true, data };
  }

  @Post(':id/adjust-stock')
  async adjustStock(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: AdjustStockDto,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.adjustStock(user.id, id, body);
    return { success: true, data };
  }

  @Get(':id/movements')
  async getMovements(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.getMovements(user.id, id);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.remove(user.id, id);
    return { success: true, data };
  }
}
