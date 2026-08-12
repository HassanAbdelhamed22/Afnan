import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getWishableProduct: vi.fn(),
  listProductsForWishlist: vi.fn(),
  getWishlistItemsRecord: vi.fn(),
  addWishlistItemRecord: vi.fn(),
  removeWishlistItemRecord: vi.fn(),
}));

vi.mock("@/modules/catalog/commerce", () => ({
  getWishableProduct: mocks.getWishableProduct,
  listProductsForWishlist: mocks.listProductsForWishlist,
}));
vi.mock("@/modules/wishlist/repository", () => ({
  getWishlistItemsRecord: mocks.getWishlistItemsRecord,
  addWishlistItemRecord: mocks.addWishlistItemRecord,
  removeWishlistItemRecord: mocks.removeWishlistItemRecord,
}));

import { addWishlistItem, getWishlist, removeWishlistItem } from "@/modules/wishlist/service";

const productId = "507f1f77bcf86cd799439011";

function record() {
  return {
    productId: { toString: () => productId },
    addedAt: new Date("2026-08-12T00:00:00Z"),
  };
}

describe("wishlist service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWishableProduct.mockResolvedValue({ id: productId });
    mocks.getWishlistItemsRecord.mockResolvedValue([]);
    mocks.listProductsForWishlist.mockResolvedValue([]);
  });

  it("validates current catalog visibility before saving", async () => {
    await addWishlistItem("customer-1", productId);

    expect(mocks.getWishableProduct).toHaveBeenCalledWith(productId);
    expect(mocks.addWishlistItemRecord).toHaveBeenCalledWith("customer-1", productId);
  });

  it("maps current catalog products and preserves unavailable saved entries", async () => {
    mocks.getWishlistItemsRecord.mockResolvedValue([record()]);
    mocks.listProductsForWishlist.mockResolvedValue([undefined]);

    const wishlist = await getWishlist("customer-1");

    expect(wishlist.itemCount).toBe(1);
    expect(wishlist.productIds).toEqual([productId]);
    expect(wishlist.items[0]).toMatchObject({ productId, available: false });
  });

  it("removes only from the authenticated customer's wishlist", async () => {
    await removeWishlistItem("customer-1", productId);
    expect(mocks.removeWishlistItemRecord).toHaveBeenCalledWith("customer-1", productId);
  });
});
