"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringSessionController = void 0;
const common_1 = require("@nestjs/common");
const monitoring_session_service_js_1 = require("./monitoring-session.service.js");
const monitoring_session_item_dto_js_1 = require("./dto/monitoring-session-item.dto.js");
const pull_monitoring_sessions_query_dto_js_1 = require("./dto/pull-monitoring-sessions-query.dto.js");
const current_user_decorator_js_1 = require("../../../modules/auth/decorators/current-user.decorator.js");
let MonitoringSessionController = class MonitoringSessionController {
    monitoringSessionService;
    constructor(monitoringSessionService) {
        this.monitoringSessionService = monitoringSessionService;
    }
    async push(user, body) {
        const synced = await this.monitoringSessionService.push(user.id, body);
        return { success: true, synced };
    }
    async pull(user, query) {
        const data = await this.monitoringSessionService.pull(user.id, query);
        return { success: true, data };
    }
};
exports.MonitoringSessionController = MonitoringSessionController;
__decorate([
    (0, common_1.Post)('push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new common_1.ParseArrayPipe({ items: monitoring_session_item_dto_js_1.MonitoringSessionItemDto, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], MonitoringSessionController.prototype, "push", null);
__decorate([
    (0, common_1.Get)('pull'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pull_monitoring_sessions_query_dto_js_1.PullMonitoringSessionsQueryDto]),
    __metadata("design:returntype", Promise)
], MonitoringSessionController.prototype, "pull", null);
exports.MonitoringSessionController = MonitoringSessionController = __decorate([
    (0, common_1.Controller)('monitoring-sessions'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [monitoring_session_service_js_1.MonitoringSessionService])
], MonitoringSessionController);
//# sourceMappingURL=monitoring-session.controller.js.map