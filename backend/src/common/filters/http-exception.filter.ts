import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : Array.isArray((exceptionResponse as { message?: unknown })?.message)
          ? (exceptionResponse as { message: string[] }).message
          : (exceptionResponse as { message?: string })?.message ?? 'Internal server error';

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} failed with ${statusCode}`,
        exception instanceof Error ? exception.stack : undefined
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error:
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'error' in exceptionResponse
          ? (exceptionResponse as { error?: string }).error
          : exception instanceof HttpException
            ? exception.name
            : 'InternalServerError',
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId: response.getHeader('x-request-id') ?? request.headers['x-request-id'] ?? null
    });
  }
}
