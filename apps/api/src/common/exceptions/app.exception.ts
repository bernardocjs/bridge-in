import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode: HttpStatus,
    details?: Record<string, unknown>,
  ) {
    super({ code, message, details }, statusCode);
    this.code = code;
    this.details = details;
  }
}
