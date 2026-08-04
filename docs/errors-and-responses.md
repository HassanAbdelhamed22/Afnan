# Error Handling and Response Contracts

This document explains the standardized error architecture and response contracts implemented in the **Afnan** codebase. These guidelines ensure strict API consistency, type safety, and prevent internal database leakages to clients.

---

## 1. Error Foundations

All application errors are located in [src/lib/errors/](file:///d:/JS/Next.js/Afnan/src/lib/errors/).

### 1.1 Error Codes
Located in [error-codes.ts](file:///d:/JS/Next.js/Afnan/src/lib/errors/error-codes.ts), this file exports a central registry of error categories:
*   `VALIDATION_ERROR`: Staged data failed form or field validation checks.
*   `UNAUTHENTICATED`: No valid session exists.
*   `FORBIDDEN`: User does not own the resource or lacks the ADMIN role.
*   `NOT_FOUND`: Resource could not be found in the database.
*   `CONFLICT`: Database state constraint violated (e.g. duplicate slug or stock depletion).
*   `RATE_LIMITED`: Request rate exceeds threshold.
*   `INVALID_CREDENTIALS`: Login details do not match.
*   `ACCOUNT_INACTIVE`: Account is suspended.
*   `INVALID_STATE`: Operations requested in an unsupported checkout/order flow.
*   `INTERNAL_ERROR`: Uncaught application failures.

### 1.2 Base Application Error (`AppError`)
Located in [app-error.ts](file:///d:/JS/Next.js/Afnan/src/lib/errors/app-error.ts), `AppError` extends the native JavaScript `Error` to attach metadata:
*   `code`: A key matching one of the `ErrorCode` values.
*   `statusCode`: The appropriate HTTP status code (e.g. 401, 403, 404, 409).
*   `details`: Optional structured diagnostics payload (such as field validations).
*   `expose`: Boolean flag (defaults to `true`) controlling whether the exact message is returned to the user or obscured.

#### Concrete Subclasses
To simplify code throwing exceptions, use the following helpers:
*   `UnauthenticatedError` (401 status)
*   `ForbiddenError` (403 status)
*   `NotFoundError` (404 status)
*   `ConflictError` (409 status)
*   `InvalidStateError` (422 status)

---

## 2. Response Contracts

Afnan uses separate contracts for **Server Actions** and **API Route Handlers**.

### 2.1 Server Action Contract (`ActionResult<T>`)
Located in [action-result.ts](file:///d:/JS/Next.js/Afnan/src/lib/results/action-result.ts).
Server Actions are direct server executions in Next.js and do not return HTTP status codes. Instead, they must return a typed `ActionResult<T>` structure:

#### Success Structure
```typescript
{
  ok: true,
  data: T,
  message?: string
}
```

#### Failure Structure
```typescript
{
  ok: false,
  error: {
    code: ErrorCode,
    message: string,
    fieldErrors?: Record<string, string[]>
  }
}
```

#### Usage Helpers
*   Use `actionSuccess(data, message)` to return successful actions.
*   Use `actionFailure(code, message, fieldErrors)` to return action failures (such as form validation errors).

---

### 2.2 Route Handler Contract (`ApiSuccess<T>` & `ApiFailure`)
Located in [api-response.ts](file:///d:/JS/Next.js/Afnan/src/lib/http/api-response.ts).
Custom API routes (GET, POST, etc.) return standard HTTP responses structured as JSON objects:

#### Success Structure (Returns `NextResponse`)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional messaging details",
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

#### Failure Structure (Returns `NextResponse`)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Administrator access is required",
    "details": {},
    "requestId": "2ecbd98f-..."
  }
}
```

#### Usage Helpers
*   Use `apiSuccess(data, { status, message, meta })` inside Route Handlers.
*   Use `apiFailure(error, status)` inside custom middleware or handlers.
*   *Note: Do not wrap Better Auth's `/api/auth/[...all]` endpoint in this structure, as Better Auth clients expect its native response formats.*

---

## 3. Automation and Wrapping Middleware

### 3.1 Exception Boundary Decorator (`withApiHandler`)
Located in [with-api-handler.ts](file:///d:/JS/Next.js/Afnan/src/lib/http/with-api-handler.ts).
Instead of writing individual `try/catch` blocks inside every Route Handler, wrap your handlers using `withApiHandler`:

```typescript
// src/app/api/example/route.ts
import { apiSuccess } from "@/lib/http/api-response";
import { withApiHandler } from "@/lib/http/with-api-handler";

export const GET = withApiHandler(async (request) => {
  // If an error is thrown here, the wrapper will catch it and structure the API response
  return apiSuccess({ status: "healthy" });
});
```

### 3.2 Error Converter (`errorToApiResponse`)
Located in [error-handler.ts](file:///d:/JS/Next.js/Afnan/src/lib/errors/error-handler.ts).
When `withApiHandler` catches an exception, it runs `errorToApiResponse` to format the outgoing error:
1.  **Zod validation errors**: Automatically mapped to a `VALIDATION_ERROR` with a `422` status and structured field errors under `details`.
2.  **AppError subclass**: Mapped to its custom `code` and `statusCode`. If `expose` is true, the custom message and details are shown; otherwise, a generic message is shown.
3.  **Unexpected errors**: Logged on the server side with a unique `requestId` UUID. The client receives a generic `INTERNAL_ERROR` (500 status) with the matching `requestId` for debugging references.

---

## 4. Rule Checklist

1.  **Obscure Secrets**: Never expose database structures, MongoDB stack traces, provider keys, reset tokens, or auth cookies to the client.
2.  **Validation**: Validate incoming payloads using Zod on the server. Caught validation errors are converted to `422` responses.
3.  **Actions vs Route Handlers**: Use `ActionResult` for Server Actions, and `apiSuccess`/`apiFailure` (wrapped in `withApiHandler`) for custom REST API routes.
