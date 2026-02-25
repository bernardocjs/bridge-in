import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppException } from '../exceptions/app.exception';
import { ExceptionCodes } from '../exceptions/exception-codes';

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

const PRISMA_ERROR_MAP: Record<
  string,
  { status: HttpStatus; code: string; message: string }
> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    code: ExceptionCodes.RESOURCE_ALREADY_EXISTS,
    message: 'A record with this value already exists',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    code: ExceptionCodes.RESOURCE_NOT_FOUND,
    message: 'Record not found',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    code: ExceptionCodes.INVALID_REFERENCE,
    message: 'Referenced record does not exist',
  },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(AllExceptionsFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.resolveException(exception, request);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { err: exception, path: request.url, method: request.method },
        body.message,
      );
    } else {
      this.logger.warn(
        { code: body.code, path: request.url, method: request.method },
        body.message,
      );
    }

    response.status(status).json(body);
  }

  private resolveException(
    exception: unknown,
    _request: Request,
  ): { status: number; body: ErrorResponse } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        body: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        code: ExceptionCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      },
    };
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    body: ErrorResponse;
  } {
    const mapped = PRISMA_ERROR_MAP[exception.code];

    if (mapped) {
      const details: Record<string, unknown> = {};

      if (exception.code === 'P2002' && exception.meta?.target) {
        details.fields = exception.meta.target;
      }

      return {
        status: mapped.status,
        body: {
          code: mapped.code,
          message: mapped.message,
          ...(Object.keys(details).length > 0 && { details }),
        },
      };
    }

    return {
      status: HttpStatus.BAD_REQUEST,
      body: {
        code: ExceptionCodes.INTERNAL_ERROR,
        message: 'Database operation failed',
      },
    };
  }

  private handleHttpException(exception: HttpException): {
    status: number;
    body: ErrorResponse;
  } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const response = exceptionResponse as Record<string, unknown>;

      if (Array.isArray(response.message)) {
        return {
          status,
          body: {
            code: ExceptionCodes.VALIDATION_ERROR,
            message: 'Validation failed',
            details: { errors: response.message },
          },
        };
      }

      return {
        status,
        body: {
          code: (response.code as string) || this.statusToCode(status),
          message: (response.message as string) || 'An error occurred',
        },
      };
    }

    return {
      status,
      body: {
        code: this.statusToCode(status),
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : 'An error occurred',
      },
    };
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: ExceptionCodes.VALIDATION_ERROR,
      401: ExceptionCodes.AUTH_UNAUTHORIZED,
      403: ExceptionCodes.AUTH_UNAUTHORIZED,
      404: ExceptionCodes.RESOURCE_NOT_FOUND,
      409: ExceptionCodes.RESOURCE_ALREADY_EXISTS,
    };
    return map[status] || ExceptionCodes.INTERNAL_ERROR;
  }
}
