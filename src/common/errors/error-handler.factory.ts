import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ApplicationError {
  code: ErrorCode;
  message: string;
  context?: Record<string, any>;
}

export class ErrorHandlerFactory {
  private static logger = new Logger('ErrorHandlerFactory');

  static createError(error: ApplicationError): never {
    const { code, message, context } = error;

    this.logger.error(`[${code}] ${message}`, context);

    switch (code) {
      case ErrorCode.VALIDATION_ERROR:
        throw new BadRequestException(message);
      case ErrorCode.NOT_FOUND:
        throw new NotFoundException(message);
      case ErrorCode.UNAUTHORIZED:
        throw new UnauthorizedException(message);
      case ErrorCode.CONFLICT:
        throw new ConflictException(message);
      case ErrorCode.INTERNAL_ERROR:
      default:
        throw new InternalServerErrorException(message);
    }
  }

  static handleDatabaseError(error: any, context: string): never {
    const code = error.code;
    let applicationError: ApplicationError;

    switch (code) {
      case '23505': // unique_violation
        applicationError = {
          code: ErrorCode.CONFLICT,
          message: 'Resource already exists',
          context: { originalError: error.detail, context },
        };
        break;
      case '23503': // foreign_key_violation
        applicationError = {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid reference to related resource',
          context: { originalError: error.detail, context },
        };
        break;
      default:
        applicationError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Database operation failed',
          context: { originalError: error.message, context },
        };
    }

    this.createError(applicationError);
  }
}
