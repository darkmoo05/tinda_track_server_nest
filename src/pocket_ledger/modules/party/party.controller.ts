import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PartyService } from './party.service.js';
import { PartyItemDto } from './dto/party-item.dto.js';
import { PullPartiesQueryDto } from './dto/pull-parties-query.dto.js';
import { Public } from '../../../modules/auth/decorators/public.decorator.js';

@Controller('parties')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Public()
  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(
    @Body(new ParseArrayPipe({ items: PartyItemDto, whitelist: true })) body: PartyItemDto[],
  ): Promise<{ success: boolean; synced: number }> {
    const synced = await this.partyService.push(body);
    return { success: true, synced };
  }

  @Public()
  @Get('pull')
  async pull(@Query() query: PullPartiesQueryDto): Promise<{ success: boolean; data: unknown[] }> {
    const data = await this.partyService.pull(query);
    return { success: true, data };
  }
}
