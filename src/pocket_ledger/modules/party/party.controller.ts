import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PartyService } from './party.service.js';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';
import { CurrentUser, type AuthUser } from '../../../modules/auth/decorators/current-user.decorator.js';

@Controller('parties')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @CurrentUser() user: AuthUser,
    @Body(new ParseArrayPipe({ items: PartyItemDto, whitelist: true })) body: PartyItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.partyService.push(user.id, body);
    return { success: true, synced };
  }

  @Get('pull')
  async pull(
    @CurrentUser() user: AuthUser,
    @Query() query: PullPartiesQueryDto,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.partyService.pull(user.id, query);
    return { success: true, data };
  }
}
