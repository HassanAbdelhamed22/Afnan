import type { NextRequest } from "next/server";

import { errorToApiResponse } from "@/lib/errors/error-handler";

type RouteHandler<TContext = unknown> = (
  request: NextRequest,
  context: TContext,
) => Promise<Response>;

export function withApiHandler<TContext = unknown>(
  handler: RouteHandler<TContext>,
): RouteHandler<TContext> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorToApiResponse(error);
    }
  };
}
