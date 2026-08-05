import { describe, it, expect, vi, beforeEach } from "vitest";

import { registerAction, loginAction, logoutAction, forgotPasswordAction, resetPasswordAction } from "@/modules/auth/actions";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => {
  return {
    auth: {
      api: {
        signUpEmail: vi.fn(),
        signInEmail: vi.fn(),
        signOut: vi.fn(),
        requestPasswordReset: vi.fn(),
        resetPassword: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
}));

describe("Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerAction", () => {
    it("should return validation error failure if schema check fails", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");

      const result = await registerAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should return validation error failure if phone number is invalid", async () => {
      const formData = new FormData();
      formData.append("name", "Hassan");
      formData.append("email", "hassan@example.com");
      formData.append("phone", "12345");
      formData.append("whatsappPhone", "01012345678");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      const result = await registerAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.fieldErrors?.phone?.[0] || result.error.message).toContain("valid Egyptian");
      }
    });

    it("should call auth.api.signUpEmail and return success on correct inputs", async () => {
      const formData = new FormData();
      formData.append("name", "Hassan");
      formData.append("email", "hassan@example.com");
      formData.append("phone", "01012345678");
      formData.append("whatsappPhone", "01112345678");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      vi.mocked(auth.api.signUpEmail).mockResolvedValue({} as unknown as never);

      const result = await registerAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(true);
      expect(auth.api.signUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            name: "Hassan",
            email: "hassan@example.com",
            password: "password123",
            phoneE164: "+201012345678",
            whatsappE164: "+201112345678",
          },
        })
      );
    });
  });

  describe("loginAction", () => {
    it("should return validation error failure if fields are missing", async () => {
      const formData = new FormData();
      const result = await loginAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should call auth.api.signInEmail and redirect on success", async () => {
      const formData = new FormData();
      formData.append("email", "hassan@example.com");
      formData.append("password", "password123");
      formData.append("returnTo", "/shop");

      vi.mocked(auth.api.signInEmail).mockResolvedValue({} as unknown as never);

      await loginAction({ ok: true, data: {} }, formData);
      expect(auth.api.signInEmail).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/shop");
    });

    it("should return invalid credentials failure on auth APIError", async () => {
      const formData = new FormData();
      formData.append("email", "hassan@example.com");
      formData.append("password", "wrong-password");

      const mockError = new APIError("UNAUTHORIZED", { message: "Invalid email or password" });
      vi.mocked(auth.api.signInEmail).mockRejectedValue(mockError);

      const result = await loginAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_CREDENTIALS");
        expect(result.error.message).toContain("Invalid email or password");
      }
    });
  });

  describe("logoutAction", () => {
    it("should call auth.api.signOut and redirect to root", async () => {
      vi.mocked(auth.api.signOut).mockResolvedValue({} as unknown as never);

      await logoutAction();
      expect(auth.api.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/");
    });
  });

  describe("forgotPasswordAction", () => {
    it("should call auth.api.requestPasswordReset and return success generic message", async () => {
      const formData = new FormData();
      formData.append("email", "hassan@example.com");

      vi.mocked(auth.api.requestPasswordReset).mockResolvedValue({} as unknown as never);

      const result = await forgotPasswordAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(true);
      expect(auth.api.requestPasswordReset).toHaveBeenCalledWith({
        body: {
          email: "hassan@example.com",
          redirectTo: "http://localhost:3000/reset-password",
        },
      });
    });
  });

  describe("resetPasswordAction", () => {
    it("should call auth.api.resetPassword and return success on correct inputs", async () => {
      const formData = new FormData();
      formData.append("token", "valid-token");
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "newpassword123");

      vi.mocked(auth.api.resetPassword).mockResolvedValue({} as unknown as never);

      const result = await resetPasswordAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(true);
      expect(auth.api.resetPassword).toHaveBeenCalledWith({
        body: {
          token: "valid-token",
          newPassword: "newpassword123",
        },
      });
    });

    it("should return invalid state failure if resetPassword throws", async () => {
      const formData = new FormData();
      formData.append("token", "invalid-token");
      formData.append("password", "newpassword123");
      formData.append("confirmPassword", "newpassword123");

      vi.mocked(auth.api.resetPassword).mockRejectedValue(new Error("Database error"));

      const result = await resetPasswordAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_STATE");
      }
    });
  });
});
