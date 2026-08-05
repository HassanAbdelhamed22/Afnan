import { describe, it, expect, vi, beforeEach } from "vitest";

import { getCurrentSession, requireUser, requireAdmin, getCurrentUserDTO } from "@/modules/auth/dal";
import { UnauthenticatedError, ForbiddenError } from "@/lib/errors/app-error";
import { auth } from "@/lib/auth/auth";

vi.mock("react", () => ({
  cache: <T>(fn: T): T => fn,
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("@/lib/auth/auth", () => {
  return {
    auth: {
      api: {
        getSession: vi.fn(),
      },
    },
  };
});

describe("Auth DAL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentSession", () => {
    it("should call auth.api.getSession and return it", async () => {
      const mockSession = { user: { id: "1" } };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as typeof auth.$Infer.Session);

      const session = await getCurrentSession();
      expect(session).toEqual(mockSession);
      expect(auth.api.getSession).toHaveBeenCalled();
    });
  });

  describe("requireUser", () => {
    it("should throw UnauthenticatedError if there is no session", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(requireUser()).rejects.toThrow(UnauthenticatedError);
    });

    it("should throw ForbiddenError if the user status is not ACTIVE", async () => {
      const mockSession = { user: { id: "1", status: "SUSPENDED" } };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as typeof auth.$Infer.Session);

      await expect(requireUser()).rejects.toThrow(ForbiddenError);
    });

    it("should return the session if the user is active", async () => {
      const mockSession = { user: { id: "1", status: "ACTIVE" } };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as typeof auth.$Infer.Session);

      const session = await requireUser();
      expect(session).toEqual(mockSession);
    });
  });

  describe("requireAdmin", () => {
    it("should throw ForbiddenError if the user is active but not an ADMIN", async () => {
      const mockSession = { user: { id: "1", status: "ACTIVE", role: "CUSTOMER" } };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as typeof auth.$Infer.Session);

      await expect(requireAdmin()).rejects.toThrow(ForbiddenError);
    });

    it("should return the session if the user is an active ADMIN", async () => {
      const mockSession = { user: { id: "1", status: "ACTIVE", role: "ADMIN" } };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as typeof auth.$Infer.Session);

      const session = await requireAdmin();
      expect(session).toEqual(mockSession);
    });
  });

  describe("getCurrentUserDTO", () => {
    it("should return null if there is no session", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const dto = await getCurrentUserDTO();
      expect(dto).toBeNull();
    });

    it("should return a projection of user details if session exists", async () => {
      const mockSession = {
        user: {
          id: "1",
          name: "Hassan",
          email: "hassan@example.com",
          role: "CUSTOMER",
          phoneE164: "+201012345678",
          whatsappE164: "+201012345678",
          createdAt: new Date(),
        },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as typeof auth.$Infer.Session);

      const dto = await getCurrentUserDTO();
      expect(dto).toEqual({
        id: "1",
        name: "Hassan",
        email: "hassan@example.com",
        role: "CUSTOMER",
        phoneE164: "+201012345678",
        whatsappE164: "+201012345678",
      });
    });
  });
});
