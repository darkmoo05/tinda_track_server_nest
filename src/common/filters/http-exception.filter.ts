import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nestjs';

/**
 * Global HTTP exception filter.
 *
 * Converts all thrown HttpExceptions, unexpected errors, and database-specific
 * Prisma exceptions into a standardized { success, message, correlationId } envelope.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      response.getHeader('X-Correlation-Id') ||
      'N/A';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody = exception.getResponse();
      message = typeof resBody === 'object' && resBody !== null
        ? (resBody as any).message ?? exception.message
        : exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Map Prisma database error codes to standardized HTTP exceptions
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          status = HttpStatus.CONFLICT;
          message = `Unique constraint failed on field: ${((exception.meta?.target) as string[] ?? []).join(', ')}`;
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Requested record was not found or has been deleted';
          break;
        case 'P2003': // Foreign key constraint failed
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed. Related record does not exist';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Database error: ${exception.message}`;
          break;
      }
    } else if (exception instanceof Error) {
      // Keep internal error stack traces in logs but do not send them to clients
      message = exception.message;
    }

    // Hide stack traces and generic internal errors from clients in production
    const isProduction = process.env.NODE_ENV === 'production';
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && isProduction) {
      message = 'An unexpected internal error occurred';
    }

    // Capture unhandled internal server errors in Sentry
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
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

    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} → Status: ${status} → Error: ${
        exception instanceof Error ? exception.message : String(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      message,
      correlationId,
    });
  }
}

