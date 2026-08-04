import type { ErrorCode } from "./error-codes";

type AppErrorOptions = {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: unknown;
  expose?: boolean;
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);

    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.expose = options.expose ?? true;
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentication is required") {
    super({
      code: "UNAUTHENTICATED",
      message,
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You are not allowed to do this") {
    super({
      code: "FORBIDDEN",
      message,
      statusCode: 403,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({
      code: "NOT_FOUND",
      message,
      statusCode: 404,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      code: "CONFLICT",
      message,
      statusCode: 409,
      details,
    });
  }
}

export class InvalidStateError extends AppError {
  constructor(message: string) {
    super({
      code: "INVALID_STATE",
      message,
      statusCode: 422,
    });
  }
}
