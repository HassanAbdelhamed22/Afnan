import { NextResponse } from "next/server";

import type { ErrorCode } from "@/lib/errors/error-codes";

export type ApiMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  requestId?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: ApiMeta;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
  };
};

type SuccessOptions = {
  status?: number;
  message?: string;
  meta?: ApiMeta;
};

export function apiSuccess<T>(
  data: T,
  options: SuccessOptions = {},
) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    message: options.message,
    meta: options.meta,
  };

  return NextResponse.json(body, {
    status: options.status ?? 200,
  });
}

export function apiFailure(
  error: ApiFailure["error"],
  status: number,
) {
  const body: ApiFailure = {
    success: false,
    error,
  };

  return NextResponse.json(body, {
    status,
  });
}
