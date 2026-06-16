import { Module } from '@nestjs/common';
import { MonitoringSessionController } from './monitoring-session.controller.js';
import { MonitoringSessionService } from './monitoring-session.service.js';

@Module({
  controllers: [MonitoringSessionController],
  providers: [MonitoringSessionService],
  exports: [MonitoringSessionService],
})
export class MonitoringSessionModule {}
