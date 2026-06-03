"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
let LoggingMiddleware = class LoggingMiddleware {
    logger = new common_1.Logger('HTTP');
    use(req, res, next) {
        const correlationId = req.id ||
            req.headers['x-correlation-id'] ||
            req.headers['x-request-id'] ||
            (0, node_crypto_1.randomUUID)();
        res.setHeader('X-Correlation-Id', correlationId);
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const start = Date.now();
        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - start;
            this.logger.log(`[${correlationId}] ${method} ${originalUrl} ${statusCode} ${duration}ms - ${userAgent} ${ip}`);
        });
        next();
    }
};
exports.LoggingMiddleware = LoggingMiddleware;
exports.LoggingMiddleware = LoggingMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggingMiddleware);
//# sourceMappingURL=logging.middleware.js.map