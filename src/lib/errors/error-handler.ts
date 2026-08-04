import { randomUUID } from "node:crypto";

import { ZodError } from "zod";

import { AppError } from "./app-error";
import { apiFailure } from "@/lib/http/api-response";

export function errorToApiResponse(error: unknown) {
  const requestId = randomUUID();

  if (error instanceof ZodError) {
    return apiFailure(
      {
        code: "VALIDATION_ERROR",
        message: "The submitted data is invalid",
        details: error.flatten().fieldErrors,
        requestId,
      },
      422,
    );
  }

  if (error instanceof AppError) {
    return apiFailure(
      {
        code: error.code,
        message: error.expose
          ? error.message
          : "An unexpected error occurred",
        details: error.expose
          ? error.details
          : undefined,
        requestId,
      },
      error.statusCode,
    );
  }

  console.error("Unexpected application error", {
    requestId,
    error,
  });

  return apiFailure(
    {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      requestId,
    },
    500,
  );
}
