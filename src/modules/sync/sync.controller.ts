import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { SyncRequestDto } from './dto/sync.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async sync(@Body() body: SyncRequestDto) {
    const pushData = body.push ?? {};
    return this.syncService.pushAndPull(body.deviceId, body.lastSync, pushData);
  }
}
