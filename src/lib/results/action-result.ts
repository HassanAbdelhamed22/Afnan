import type { ErrorCode } from "@/lib/errors/error-codes";

export type FieldErrors = Record<string, string[]>;

export type ActionSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
};

export type ActionFailure = {
  ok: false;
  error: {
    code: ErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  };
};

export type ActionResult<T> =
  | ActionSuccess<T>
  | ActionFailure;

export function actionSuccess<T>(
  data: T,
  message?: string,
): ActionSuccess<T> {
  return {
    ok: true,
    data,
    message,
  };
}

export function actionFailure(
  code: ErrorCode,
  message: string,
  fieldErrors?: FieldErrors,
): ActionFailure {
  return {
    ok: false,
    error: {
      code,
      message,
      fieldErrors,
    },
  };
}
