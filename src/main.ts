import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Allow cross-origin requests during external tunnel testing.
  app.enableCors({
    origin: true,
    credentials: true,
  });

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

