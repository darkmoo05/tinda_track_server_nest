"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const Sentry = __importStar(require("@sentry/nestjs"));
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = request.headers['x-correlation-id'] ||
            response.getHeader('X-Correlation-Id') ||
            'N/A';
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const resBody = exception.getResponse();
            message = typeof resBody === 'object' && resBody !== null
                ? resBody.message ?? exception.message
                : exception.message;
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    status = common_1.HttpStatus.CONFLICT;
                    message = `Unique constraint failed on field: ${((exception.meta?.target) ?? []).join(', ')}`;
                    break;
                case 'P2025':
                    status = common_1.HttpStatus.NOT_FOUND;
                    message = 'Requested record was not found or has been deleted';
                    break;
                case 'P2003':
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = 'Foreign key constraint failed. Related record does not exist';
                    break;
                default:
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = `Database error: ${exception.message}`;
                    break;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const isProduction = process.env.NODE_ENV === 'production';
        if (status === common_1.HttpStatus.INTERNAL_SERVER_ERROR && isProduction) {
            message = 'An unexpected internal error occurred';
        }
        if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            Sentry.withScope((scope) => {
                scope.setExtra('url', request.url);
                scope.setExtra('method', request.method);
                scope.setExtra('correlationId', correlationId);
                const deviceId = request.headers['x-device-id'];
                if (typeof deviceId === 'string') {
                    scope.setTag('deviceId', deviceId);
                }
                Sentry.captureException(exception);
            });
        }
        this.logger.error(`[${correlationId}] ${request.method} ${request.url} → Status: ${status} → Error: ${exception instanceof Error ? exception.message : String(exception)}`, exception instanceof Error ? exception.stack : undefined);
        response.status(status).json({
            success: false,
            message,
            correlationId,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map