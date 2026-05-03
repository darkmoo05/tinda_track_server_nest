import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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

  const port = process.env.PORT ?? 8080;
  await app.listen(port);
  console.log(`Tinda Track NestJS server listening on port ${port}`);
}

bootstrap();

