import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get error message
    let message: string;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else {
      message = 'An error occurred';
    }

    // Log error details (for debugging)
    const errorDetails = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(exception instanceof Error && { stack: exception.stack }),
    };

    // Log error (don't expose stack trace in production)
    if (status >= 500) {
      // Server errors - log full details
      this.logger.error(
        `${request.method} ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      // Client errors - log minimal details
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    }

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';

    // Response for production (no stack traces, generic messages for 500 errors)
    const responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        status >= 500 && isProduction
          ? 'Internal server error'
          : message,
    };

    // Add validation errors if present
    if (
      exception instanceof HttpException &&
      typeof exception.getResponse() === 'object'
    ) {
      const exceptionResponse = exception.getResponse() as any;
      if (Array.isArray(exceptionResponse.message)) {
        responseBody.message = exceptionResponse.message;
      }
    }

    response.status(status).json(responseBody);
  }
}
