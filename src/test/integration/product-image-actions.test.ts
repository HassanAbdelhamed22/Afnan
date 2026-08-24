import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), attach: vi.fn(), request: vi.fn(), approve: vi.fn(), remove: vi.fn(), order: vi.fn(), discard: vi.fn(), productCache: vi.fn(), categoryCache: vi.fn(), path: vi.fn(), logError: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.path }));
vi.mock("@/modules/auth/dal", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/modules/catalog/queries", () => ({ revalidateProductCache: mocks.productCache, revalidateCategoryCache: mocks.categoryCache }));
vi.mock("@/modules/products/image-service", () => ({ attachProductImage: mocks.attach, requestProductImageEnhancement: mocks.request, approveProductImage: mocks.approve, removeProductImage: mocks.remove, orderProductImage: mocks.order }));
vi.mock("@/modules/uploads/service", () => ({ discardUploadIntent: mocks.discard }));
vi.mock("@/lib/logger", () => ({ logger: { error: mocks.logError } }));

import { attachProductImageAction, removeProductImageAction, requestProductImageEnhancementAction } from "@/modules/products/image-actions";

const product = { id: "507f1f77bcf86cd799439012", slug: "linen-bag", categoryId: "507f1f77bcf86cd799439013" };
describe("product image actions", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.requireAdmin.mockResolvedValue({ user: { id: "admin-1" } }); mocks.attach.mockResolvedValue(product); mocks.request.mockResolvedValue(product); mocks.remove.mockResolvedValue(product); mocks.discard.mockResolvedValue(false); });
  it("authorizes before validating image input", async () => { const result = await attachProductImageAction(new FormData()); expect(mocks.requireAdmin).toHaveBeenCalledOnce(); expect(mocks.attach).not.toHaveBeenCalled(); expect(result.ok).toBe(false); });
  it("claims product uploads under the authenticated admin and invalidates public caches", async () => {
    const form = new FormData(); form.set("productId", product.id); form.set("intentId", "507f1f77bcf86cd799439014"); form.set("alt", "Natural linen shoulder bag");
    const result = await attachProductImageAction(form);
    expect(mocks.attach).toHaveBeenCalledWith("admin-1", product.id, "507f1f77bcf86cd799439014", "Natural linen shoulder bag", "CONTAIN", undefined);
    expect(mocks.productCache).toHaveBeenCalledWith(product.id, product.slug); expect(mocks.categoryCache).toHaveBeenCalledWith(product.categoryId); expect(result.ok).toBe(true);
    expect(mocks.path).toHaveBeenCalledWith("/");
    expect(mocks.path).toHaveBeenCalledWith("/shop");
    expect(mocks.path).toHaveBeenCalledWith("/category/[slug]", "page");
    expect(mocks.path).toHaveBeenCalledWith(`/product/${product.slug}`);
  });
  it("invalidates catalog routes after removing an image so cards cannot retain the old primary", async () => {
    const form = new FormData(); form.set("productId", product.id); form.set("publicId", "afnan/products/admin/old-primary");
    const result = await removeProductImageAction(form);
    expect(result.ok).toBe(true);
    expect(mocks.remove).toHaveBeenCalledWith(product.id, "afnan/products/admin/old-primary");
    expect(mocks.path).toHaveBeenCalledWith("/");
    expect(mocks.path).toHaveBeenCalledWith("/shop");
    expect(mocks.path).toHaveBeenCalledWith(`/product/${product.slug}`);
  });
  it("discards an unclaimed upload when product attachment fails", async () => {
    mocks.attach.mockRejectedValue(new Error("database unavailable"));
    const form = new FormData(); form.set("productId", product.id); form.set("intentId", "507f1f77bcf86cd799439014"); form.set("alt", "Natural linen shoulder bag");
    const result = await attachProductImageAction(form);
    expect(mocks.discard).toHaveBeenCalledWith("admin-1", "507f1f77bcf86cd799439014", "PRODUCT_IMAGE");
    expect(mocks.logError).toHaveBeenCalledWith("product_image_action_failed", { operation: "attach", errorName: "Error", validationIssues: undefined });
    expect(result).toMatchObject({ ok: false, error: { code: "INTERNAL_ERROR" } });
  });
  it("guards enhancement requests and never accepts a client transformation URL", async () => {
    const form = new FormData(); form.set("productId", product.id); form.set("publicId", "afnan/products/admin/image"); form.set("enhancedUrl", "https://attacker.example/image.png");
    await requestProductImageEnhancementAction(form);
    expect(mocks.request).toHaveBeenCalledWith(product.id, "afnan/products/admin/image");
    expect(mocks.request).not.toHaveBeenCalledWith(expect.anything(), expect.stringContaining("attacker"));
  });
});
