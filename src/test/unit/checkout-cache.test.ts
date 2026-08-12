import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidateProductCache: vi.fn(),
  revalidateCategoryCache: vi.fn(),
}));

vi.mock("@/modules/catalog/queries", () => ({
  revalidateProductCache: mocks.revalidateProductCache,
  revalidateCategoryCache: mocks.revalidateCategoryCache,
}));

import { invalidatePurchasedProductCaches } from "@/modules/checkout/cache";

describe("checkout catalog invalidation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalidates each purchased product and each affected category once", () => {
    invalidatePurchasedProductCaches([
      { productId: "product-1", productSlug: "bag-one", categoryId: "bags" },
      { productId: "product-2", productSlug: "bag-two", categoryId: "bags" },
    ]);

    expect(mocks.revalidateProductCache).toHaveBeenCalledTimes(2);
    expect(mocks.revalidateProductCache).toHaveBeenCalledWith("product-1", "bag-one");
    expect(mocks.revalidateProductCache).toHaveBeenCalledWith("product-2", "bag-two");
    expect(mocks.revalidateCategoryCache).toHaveBeenCalledOnce();
    expect(mocks.revalidateCategoryCache).toHaveBeenCalledWith("bags");
  });
});
