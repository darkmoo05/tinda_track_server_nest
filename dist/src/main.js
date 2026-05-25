"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const node_path_1 = require("node:path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useStaticAssets((0, node_path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    const port = Number(process.env.PORT ?? 8080);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen(port, host);
    console.log(`Tinda Track NestJS server listening on http://${host}:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map