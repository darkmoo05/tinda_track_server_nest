import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    try {
      // Execute a quick, low-cost query to verify db connectivity
      const result = await this.prisma.user.findFirst({
        select: { id: true },
      });
      return {
        status: 'UP',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: error.message || error,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
