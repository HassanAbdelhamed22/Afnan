import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindOne = vi.fn();
vi.mock("@/lib/auth/mongo-client", () => {
  return {
    authDatabase: {
      collection: vi.fn(() => ({
        findOne: mockFindOne,
      })),
    },
    authMongoClient: {},
  };
});

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
        getSession: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
}));

export { mockFindOne };

describe("Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOne.mockResolvedValue(null);
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
      formData.append("password", "P@ssword123!");
      formData.append("confirmPassword", "P@ssword123!");

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
      formData.append("password", "P@ssword123!");
      formData.append("confirmPassword", "P@ssword123!");

      vi.mocked(auth.api.signUpEmail).mockResolvedValue({} as unknown as never);

      const result = await registerAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(true);
      expect(auth.api.signUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            name: "Hassan",
            email: "hassan@example.com",
            password: "P@ssword123!",
            phoneE164: "+201012345678",
            whatsappE164: "+201112345678",
          },
        })
      );
    });

    it("should return validation error failure if email is already registered", async () => {
      const formData = new FormData();
      formData.append("name", "Hassan");
      formData.append("email", "duplicate@example.com");
      formData.append("phone", "01012345678");
      formData.append("whatsappPhone", "01112345678");
      formData.append("password", "P@ssword123!");
      formData.append("confirmPassword", "P@ssword123!");

      mockFindOne.mockResolvedValueOnce({
        email: "duplicate@example.com",
        phoneE164: "+20199999999",
      });

      const result = await registerAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.fieldErrors?.email?.[0]).toContain("already registered");
      }
    });

    it("should return validation error failure if phone number is already registered", async () => {
      const formData = new FormData();
      formData.append("name", "Hassan");
      formData.append("email", "hassan@example.com");
      formData.append("phone", "01012345678");
      formData.append("whatsappPhone", "01112345678");
      formData.append("password", "P@ssword123!");
      formData.append("confirmPassword", "P@ssword123!");

      mockFindOne.mockResolvedValueOnce({
        email: "other@example.com",
        phoneE164: "+201012345678",
      });

      const result = await registerAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.fieldErrors?.phone?.[0]).toContain("already registered");
      }
    });
  });

  describe("loginAction", () => {
    it("should return validation error failure if fields are missing", async () => {
      const formData = new FormData();
      const result = await loginAction({ ok: true, data: { redirectTo: "" } }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should call auth.api.signInEmail and return shop redirection on success for normal customer", async () => {
      const formData = new FormData();
      formData.append("email", "hassan@example.com");
      formData.append("password", "P@ssword123!");
      formData.append("returnTo", "/shop");

      vi.mocked(auth.api.signInEmail).mockResolvedValue({} as unknown as never);
      mockFindOne.mockResolvedValueOnce({
        email: "hassan@example.com",
        role: "CUSTOMER",
      });

      const result = await loginAction({ ok: true, data: { redirectTo: "" } }, formData);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.redirectTo).toBe("/shop");
      }
      expect(auth.api.signInEmail).toHaveBeenCalled();
    });

    it("should call auth.api.signInEmail and return admin redirection on success for admin user", async () => {
      const formData = new FormData();
      formData.append("email", "hassan@example.com");
      formData.append("password", "P@ssword123!");
      formData.append("returnTo", "/shop");

      vi.mocked(auth.api.signInEmail).mockResolvedValue({} as unknown as never);
      mockFindOne.mockResolvedValueOnce({
        email: "hassan@example.com",
        role: "ADMIN",
      });

      const result = await loginAction({ ok: true, data: { redirectTo: "" } }, formData);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.redirectTo).toBe("/admin");
      }
      expect(auth.api.signInEmail).toHaveBeenCalled();
    });

    it("should return invalid credentials failure on auth APIError", async () => {
      const formData = new FormData();
      formData.append("email", "hassan@example.com");
      formData.append("password", "wrong-password");

      const mockError = new APIError("UNAUTHORIZED", { message: "Invalid email or password" });
      vi.mocked(auth.api.signInEmail).mockRejectedValue(mockError);

      const result = await loginAction({ ok: true, data: { redirectTo: "" } }, formData);
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
      formData.append("password", "newP@ssword123!");
      formData.append("confirmPassword", "newP@ssword123!");

      vi.mocked(auth.api.resetPassword).mockResolvedValue({} as unknown as never);

      const result = await resetPasswordAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(true);
      expect(auth.api.resetPassword).toHaveBeenCalledWith({
        body: {
          token: "valid-token",
          newPassword: "newP@ssword123!",
        },
      });
    });

    it("should return invalid state failure if resetPassword throws", async () => {
      const formData = new FormData();
      formData.append("token", "invalid-token");
      formData.append("password", "newP@ssword123!");
      formData.append("confirmPassword", "newP@ssword123!");

      vi.mocked(auth.api.resetPassword).mockRejectedValue(new Error("Database error"));

      const result = await resetPasswordAction({ ok: true, data: {} }, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_STATE");
      }
    });
  });
});
