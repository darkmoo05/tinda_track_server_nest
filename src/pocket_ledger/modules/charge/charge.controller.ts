import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChargeService } from './charge.service.js';
import { ChargeItemDto } from './dto/push-charges.dto.js';
import { PullChargesQueryDto } from './dto/pull-charges-query.dto.js';
import { Public } from '../../../modules/auth/decorators/public.decorator.js';

/**
 * ChargeController mirrors the Express routes exactly:
 *   POST /api/charges/push  — bulk-upsert from device
 *   GET  /api/charges/pull  — incremental pull since a timestamp
 *
 * The global prefix `api` is set in main.ts; this controller only declares
 * the `charges` segment.
 */
@Controller('charges')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  /**
   * POST /api/charges/push
   *
   * Accepts a raw array of charge objects (same shape the Flutter client sends).
   * Returns { success, synced } to keep parity with the Express response.
   */
  @Public()
  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @Body(new ParseArrayPipe({ items: ChargeItemDto, whitelist: true })) body: ChargeItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.chargeService.push(body);
    return { success: true, synced };
  }

  /**
   * GET /api/charges/pull?since=<ms>&deviceId=<id>
   *
   * Returns charges updated after `since` that originated from a different device.
   */
  @Public()
  @Get('pull')
  async pull(
    @Query() query: PullChargesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.chargeService.pull(query);
    return { success: true, data };
  }
}
