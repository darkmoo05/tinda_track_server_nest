import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';
import { UtangRecordsController } from './utang-records.controller.js';

@Module({
  controllers: [CustomersController, UtangRecordsController],
  providers: [CustomersService],
})
export class CustomersModule {}
