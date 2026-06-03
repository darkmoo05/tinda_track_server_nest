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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const node_path_1 = require("node:path");
const helmet_1 = __importDefault(require("helmet"));
const nestjs_pino_1 = require("nestjs-pino");
const swagger_1 = require("@nestjs/swagger");
const Sentry = __importStar(require("@sentry/nestjs"));
const profiling_node_1 = require("@sentry/profiling-node");
const app_module_js_1 = require("./app.module.js");
const http_exception_filter_js_1 = require("./common/filters/http-exception.filter.js");
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [(0, profiling_node_1.nodeProfilingIntegration)()],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        environment: process.env.NODE_ENV || 'development',
    });
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule, {
        bufferLogs: true,
    });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false,
    }));
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
        : [];
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? (corsOrigins.length > 0 ? corsOrigins : [/localhost/, /127\.0\.0\.1/, /10\.0\.2\.2/])
            : true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Device-Id',
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Tinda Track API')
        .setDescription('Production-grade offline-first mobile sync backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_js_1.HttpExceptionFilter());
    app.useStaticAssets((0, node_path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    const port = Number(process.env.PORT ?? 8080);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen(port, host);
    console.log(`Tinda Track NestJS server listening on http://${host}:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map