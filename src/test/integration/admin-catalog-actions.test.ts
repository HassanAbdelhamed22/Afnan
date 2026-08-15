import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(), saveProduct: vi.fn(), saveCategory: vi.fn(),
  revalidateProductCache: vi.fn(), revalidateCategoryCache: vi.fn(), revalidatePath: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/modules/auth/dal", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/modules/products/admin-repository", () => ({ saveAdminProduct: mocks.saveProduct, setAdminProductStatus: vi.fn() }));
vi.mock("@/modules/categories/admin-repository", () => ({ saveAdminCategory: mocks.saveCategory, setAdminCategoryStatus: vi.fn() }));
vi.mock("@/modules/catalog/queries", () => ({ revalidateProductCache: mocks.revalidateProductCache, revalidateCategoryCache: mocks.revalidateCategoryCache }));

import { saveCategoryAction } from "@/modules/categories/admin-actions";
import { saveProductAction } from "@/modules/products/admin-actions";

function productForm() {
  const form = new FormData();
  form.set("name", "Handwoven linen bag"); form.set("slug", "handwoven-linen-bag");
  form.set("description", "A carefully handwoven linen bag made by Egyptian artisans.");
  form.set("categoryId", "507f1f77bcf86cd799439011"); form.set("status", "DRAFT");
  form.set("fulfillmentType", "READY_MADE"); form.set("basePrice", "125.50");
  form.set("materials", "Linen"); form.set("colors", "Natural"); form.set("tags", "Bag");
  form.set("variants", JSON.stringify([{ sku: "bag-001", label: "Default", optionValues: { Style: "Default" }, stockQuantity: 3, isActive: true }]));
  return form;
}

describe("admin catalog actions", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.requireAdmin.mockResolvedValue({ user: { id: "admin-1" } }); });

  it("authorizes before returning product validation errors", async () => {
    const result = await saveProductAction({ ok: true, data: null }, new FormData());
    expect(mocks.requireAdmin).toHaveBeenCalledOnce(); expect(mocks.saveProduct).not.toHaveBeenCalled(); expect(result.ok).toBe(false);
  });

  it("normalizes money and invalidates product/category caches", async () => {
    mocks.saveProduct.mockResolvedValue({ id: "product-1", slug: "handwoven-linen-bag", categoryId: "category-1" });
    const result = await saveProductAction({ ok: true, data: null }, productForm());
    expect(mocks.saveProduct).toHaveBeenCalledWith(expect.objectContaining({ basePriceAmount: 12550, variants: [expect.objectContaining({ sku: "BAG-001" })] }));
    expect(mocks.revalidateProductCache).toHaveBeenCalledWith("product-1", "handwoven-linen-bag");
    expect(mocks.revalidateCategoryCache).toHaveBeenCalledWith("category-1"); expect(result.ok).toBe(true);
  });

  it("authorizes and saves only allow-listed category fields", async () => {
    mocks.saveCategory.mockResolvedValue({ id: "category-1", slug: "textile-art" });
    const form = new FormData(); form.set("name", "Textile Art"); form.set("slug", "textile-art"); form.set("sortOrder", "3"); form.set("isActive", "on"); form.set("role", "ADMIN");
    const result = await saveCategoryAction({ ok: true, data: null }, form);
    expect(mocks.requireAdmin).toHaveBeenCalled(); expect(mocks.saveCategory).toHaveBeenCalledWith({ name: "Textile Art", slug: "textile-art", sortOrder: 3, isActive: true }); expect(result.ok).toBe(true);
  });
});
