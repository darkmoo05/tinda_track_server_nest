import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req as any).id ||
      req.headers['x-correlation-id'] ||
      req.headers['x-request-id'] ||
      randomUUID();

    res.setHeader('X-Correlation-Id', correlationId);

    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      this.logger.log(
        `[${correlationId}] ${method} ${originalUrl} ${statusCode} ${duration}ms - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}

