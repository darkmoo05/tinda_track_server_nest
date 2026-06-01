import { Module } from '@nestjs/common';
import { PosController } from './pos.controller.js';
import { PosService } from './pos.service.js';
import { SalesSyncController } from './sales-sync.controller.js';

@Module({
  controllers: [PosController, SalesSyncController],
  providers: [PosService],
})
export class PosModule {}
