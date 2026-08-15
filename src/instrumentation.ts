import { logger } from "@/lib/logger";

type ErrorRequest = Readonly<{
  path: string;
  method: string;
}>;

type ErrorContext = Readonly<{
  routePath: string;
  routeType: "render" | "route" | "action" | "proxy";
}>;

export async function onRequestError(
  error: unknown,
  request: ErrorRequest,
  context: ErrorContext,
) {
  logger.error("unhandled_request_error", {
    errorName: error instanceof Error ? error.name : "UnknownError",
    method: request.method,
    requestPath: request.path,
    routePath: context.routePath,
    routeType: context.routeType,
  });
}
