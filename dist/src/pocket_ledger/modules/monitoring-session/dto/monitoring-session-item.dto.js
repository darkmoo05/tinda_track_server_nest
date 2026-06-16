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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringSessionItemDto = void 0;
const class_validator_1 = require("class-validator");
class MonitoringSessionItemDto {
    syncId;
    deviceId;
    name;
    status;
    startDateMs;
    endDateMs;
    startGcash;
    startMaya;
    startOnHand;
    endGcash;
    endMaya;
    endOnHand;
    isDeleted;
    createdAt;
    updatedAt;
}
exports.MonitoringSessionItemDto = MonitoringSessionItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MonitoringSessionItemDto.prototype, "syncId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MonitoringSessionItemDto.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MonitoringSessionItemDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MonitoringSessionItemDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], MonitoringSessionItemDto.prototype, "startDateMs", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o, v) => v !== null),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MonitoringSessionItemDto.prototype, "endDateMs", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MonitoringSessionItemDto.prototype, "startGcash", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MonitoringSessionItemDto.prototype, "startMaya", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MonitoringSessionItemDto.prototype, "startOnHand", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o, v) => v !== null),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MonitoringSessionItemDto.prototype, "endGcash", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o, v) => v !== null),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MonitoringSessionItemDto.prototype, "endMaya", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o, v) => v !== null),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MonitoringSessionItemDto.prototype, "endOnHand", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MonitoringSessionItemDto.prototype, "isDeleted", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MonitoringSessionItemDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MonitoringSessionItemDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=monitoring-session-item.dto.js.map