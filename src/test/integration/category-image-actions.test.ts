import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), attach: vi.fn(), remove: vi.fn(), discard: vi.fn(), categoryCache: vi.fn(), path: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.path }));
vi.mock("@/modules/auth/dal", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/modules/catalog/queries", () => ({ revalidateCategoryCache: mocks.categoryCache }));
vi.mock("@/modules/categories/image-service", () => ({ attachCategoryImage: mocks.attach, removeCategoryImage: mocks.remove }));
vi.mock("@/modules/uploads/service", () => ({ discardUploadIntent: mocks.discard }));

import { attachCategoryImageAction } from "@/modules/categories/image-actions";

describe("category image actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ user: { id: "admin-1" } });
    mocks.attach.mockResolvedValue({ id: "507f1f77bcf86cd799439012", slug: "woven-baskets" });
    mocks.discard.mockResolvedValue(false);
  });

  it("authorizes, attaches the verified intent, and invalidates category caches", async () => {
    const form = new FormData(); form.set("categoryId", "507f1f77bcf86cd799439012"); form.set("intentId", "507f1f77bcf86cd799439013"); form.set("alt", "Woven basket collection"); form.set("fitMode", "CONTAIN");

    const result = await attachCategoryImageAction(form);

    expect(mocks.attach).toHaveBeenCalledWith("admin-1", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013", "Woven basket collection", "CONTAIN", undefined);
    expect(mocks.categoryCache).toHaveBeenCalledWith("507f1f77bcf86cd799439012", "woven-baskets");
    expect(result.ok).toBe(true);
  });

  it("discards the completed upload when the category update fails", async () => {
    mocks.attach.mockRejectedValue(new Error("database unavailable"));
    const form = new FormData(); form.set("categoryId", "507f1f77bcf86cd799439012"); form.set("intentId", "507f1f77bcf86cd799439013"); form.set("alt", "Woven basket collection"); form.set("fitMode", "CONTAIN");

    const result = await attachCategoryImageAction(form);

    expect(mocks.discard).toHaveBeenCalledWith("admin-1", "507f1f77bcf86cd799439013", "CATEGORY_IMAGE");
    expect(result).toMatchObject({ ok: false, error: { code: "INTERNAL_ERROR" } });
  });
});
