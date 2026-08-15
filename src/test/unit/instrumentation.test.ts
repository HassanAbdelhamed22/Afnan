import { afterEach, describe, expect, it, vi } from "vitest";

import { onRequestError } from "@/instrumentation";

afterEach(() => vi.restoreAllMocks());

describe("request error instrumentation", () => {
  it("logs structured routing context without leaking the error message", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await onRequestError(
      new Error("mongodb://user:secret@example.invalid"),
      { method: "POST", path: "/admin/orders/AF-1" },
      { routePath: "/admin/orders/[orderNumber]", routeType: "action" },
    );

    const entry = JSON.parse(String(consoleError.mock.calls[0]?.[0]));
    expect(entry).toMatchObject({
      level: "error",
      message: "unhandled_request_error",
      errorName: "Error",
      method: "POST",
      routeType: "action",
    });
    expect(JSON.stringify(entry)).not.toContain("secret");
  });
});
