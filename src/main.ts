import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

// Initialize Sentry monitoring if DSN is set
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });
}

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

  // Parse CORS origins from environment variable in production
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? (corsOrigins.length > 0 ? corsOrigins : [/localhost/, /127\.0\.0\.1/, /10\.0\.2\.2/])
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


