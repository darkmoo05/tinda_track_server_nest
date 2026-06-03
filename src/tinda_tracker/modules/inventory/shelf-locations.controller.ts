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
import { InventoryService } from './inventory.service.js';
import { ShelfLocationRecordDto } from './dto/push-shelf-locations.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

const UPLOAD_DIR = './uploads/shelf-locations';

@Controller('inventory/shelf-locations')
export class ShelfLocationsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.listShelfLocations(user.id);
    return { success: true, data };
  }

  /** Bulk upsert — called by the Flutter sync service. */
  @Post('push')
  async push(
    @CurrentUser() user: AuthUser,
    @Body() body: ShelfLocationRecordDto[],
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.inventoryService.pushShelfLocations(user.id, body);
    return { success: true, data };
  }

  /**
   * Pull — returns all shelf locations updated since [since] milliseconds epoch.
   * Called by the Flutter sync service to receive server-side changes.
   */
  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query('since') since: string,
    @Query('deviceId') _deviceId?: string,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const sinceMs = parseInt(since ?? '0', 10);
    const data = await this.inventoryService.pullShelfLocations(user.id, sinceMs);
    return { success: true, data };
  }

  /**
   * Upload or replace a shelf location's reference photo. Mirrors the
   * product image upload pipeline; the service rebuilds the public URL via
   * the storage provider and removes any previous file on disk.
   *
   * Client sends:  PATCH /api/inventory/shelf-locations/:id/image
   *                Content-Type: multipart/form-data
   *                Field name  : "file"
   */
  @Patch(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
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
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: unknown }> {
    if (!file) throw new BadRequestException('No file provided');
    const data = await this.inventoryService.updateShelfLocationImage(user.id, id, file);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const data = await this.inventoryService.deleteShelfLocation(user.id, id);
    return { success: true, data };
  }
}
