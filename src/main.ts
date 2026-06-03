import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  
  // Use Pino logger globally
  app.useLogger(app.get(Logger));

  // Integrate Helmet security headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // Allow cross-origin requests from any origin in dev (devtunnel, emulator, real device).
  // TODO: lock this down to specific domains before going to production.
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? [/localhost/, /127\.0\.0\.1/, /10\.0\.2\.2/]
      : true,                              // allow ALL origins in dev / tunnel
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Device-Id',
  });

  // Setup Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Tinda Track API')
    .setDescription('Production-grade offline-first mobile sync backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global route prefix keeps parity with the Express /api/* routes
  app.setGlobalPrefix('api');

  // Global validation pipe — strips unknown fields, transforms query params
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown props
      forbidNonWhitelisted: false,
      transform: true,       // auto-cast query string numbers/booleans
    }),
  );

  // Global exception filter — returns { success, message } envelope
  app.useGlobalFilters(new HttpExceptionFilter());

  // Serve uploaded product images as static assets.
  // Files land in ./uploads/products/ on disk and are reachable at
  // GET /uploads/products/<filename>  (no /api prefix intentionally).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const port = Number(process.env.PORT ?? 8080);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  console.log(`Tinda Track NestJS server listening on http://${host}:${port}`);
}

bootstrap();


