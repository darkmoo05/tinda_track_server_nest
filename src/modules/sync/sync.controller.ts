import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { SyncRequestDto } from './dto/sync.dto.js';

// NOTE: @Public() has been intentionally removed.
// All sync calls now require a valid JWT bearer token.
// The Flutter AuthInterceptor already attaches the token to every request.

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sync(@Request() req: { user: { id: string } }, @Body() body: SyncRequestDto) {
    const userId = req.user.id;          // injected by JwtStrategy.validate()
    const pushData = body.push ?? {};
    return this.syncService.pushAndPull(body.deviceId, userId, body.lastSync, pushData);
  }
}
