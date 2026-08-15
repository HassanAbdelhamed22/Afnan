import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  refetchSession: vi.fn(),
  toast: vi.fn(),
  setServerErrors: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: () => [
      { ok: true, data: { redirectTo: "/account/profile" }, message: "Welcome back!" },
      vi.fn(),
      false,
    ],
  };
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/lib/auth/auth-client", () => ({
  useSession: () => ({ refetch: mocks.refetchSession }),
}));
vi.mock("@/modules/auth/actions", () => ({ loginAction: vi.fn() }));
vi.mock("@/lib/hooks/use-form-validation", () => ({
  useFormValidation: () => ({
    errors: {},
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
    setServerErrors: mocks.setServerErrors,
    validateAll: vi.fn(() => true),
  }),
}));
vi.mock("@/components/ui/toast", () => ({ toast: { show: mocks.toast } }));
vi.mock("@/components/auth/resend-verification-button", () => ({ ResendVerificationButton: () => null }));

import { LoginForm } from "@/components/auth/login-form";

describe("LoginForm session synchronization", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.refetchSession.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("refreshes the Better Auth client session before navigating", async () => {
    render(<LoginForm />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(mocks.refetchSession).toHaveBeenCalledWith({ query: { disableCookieCache: true } });
    expect(mocks.push).toHaveBeenCalledWith("/account/profile");
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(mocks.refetchSession.mock.invocationCallOrder[0]).toBeLessThan(mocks.push.mock.invocationCallOrder[0]);
  });
});
