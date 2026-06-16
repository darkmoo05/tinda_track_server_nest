"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringSessionModule = void 0;
const common_1 = require("@nestjs/common");
const monitoring_session_controller_js_1 = require("./monitoring-session.controller.js");
const monitoring_session_service_js_1 = require("./monitoring-session.service.js");
let MonitoringSessionModule = class MonitoringSessionModule {
};
exports.MonitoringSessionModule = MonitoringSessionModule;
exports.MonitoringSessionModule = MonitoringSessionModule = __decorate([
    (0, common_1.Module)({
        controllers: [monitoring_session_controller_js_1.MonitoringSessionController],
        providers: [monitoring_session_service_js_1.MonitoringSessionService],
        exports: [monitoring_session_service_js_1.MonitoringSessionService],
    })
], MonitoringSessionModule);
//# sourceMappingURL=monitoring-session.module.js.map