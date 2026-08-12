import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPurchasableVariant: vi.fn(),
  listProductsForCart: vi.fn(),
  addCartItemRecord: vi.fn(),
  getCartItemsRecord: vi.fn(),
  getOwnedCartItemRecord: vi.fn(),
  updateCartItemQuantityRecord: vi.fn(),
  removeCartItemRecord: vi.fn(),
  clearCartRecord: vi.fn(),
}));

vi.mock("@/modules/catalog/commerce", () => ({
  getPurchasableVariant: mocks.getPurchasableVariant,
  listProductsForCart: mocks.listProductsForCart,
}));
vi.mock("@/modules/cart/repository", () => ({
  addCartItemRecord: mocks.addCartItemRecord,
  getCartItemsRecord: mocks.getCartItemsRecord,
  getOwnedCartItemRecord: mocks.getOwnedCartItemRecord,
  updateCartItemQuantityRecord: mocks.updateCartItemQuantityRecord,
  removeCartItemRecord: mocks.removeCartItemRecord,
  clearCartRecord: mocks.clearCartRecord,
}));

import { addCartItem, getCart, updateCartItem } from "@/modules/cart/service";

const productId = "507f1f77bcf86cd799439011";
const variantId = "507f191e810c19729de860ea";
const itemId = "65af191e810c19729de860ea";

function variant(overrides: Record<string, unknown> = {}) {
  return {
    productId,
    variantId,
    productName: "Handmade Bag",
    productSlug: "handmade-bag",
    variantLabel: "Black",
    sku: "BAG-BLK",
    priceAmount: 25000,
    currency: "EGP",
    fulfillmentType: "READY_MADE",
    stockQuantity: 5,
    personalizationAvailable: true,
    available: true,
    ...overrides,
  };
}

describe("cart service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPurchasableVariant.mockResolvedValue(variant());
    mocks.getCartItemsRecord.mockResolvedValue([]);
    mocks.listProductsForCart.mockResolvedValue([]);
  });

  it("normalizes personalization and passes a ready-made stock ceiling", async () => {
    await addCartItem("customer-1", {
      productId,
      variantId,
      quantity: 2,
      personalization: "  Initials   AF ",
    });

    expect(mocks.addCartItemRecord).toHaveBeenCalledWith({
      userId: "customer-1",
      productId,
      variantId,
      quantity: 2,
      personalization: "Initials AF",
      maximumQuantity: 5,
    });
  });

  it("rejects personalization for products that do not support it", async () => {
    mocks.getPurchasableVariant.mockResolvedValue(
      variant({ personalizationAvailable: false }),
    );

    await expect(
      addCartItem("customer-1", {
        productId,
        variantId,
        quantity: 1,
        personalization: "AF",
      }),
    ).rejects.toThrow("does not accept personalization");
    expect(mocks.addCartItemRecord).not.toHaveBeenCalled();
  });

  it("revalidates current stock before a quantity update", async () => {
    mocks.getOwnedCartItemRecord.mockResolvedValue({
      _id: itemId,
      productId: { toString: () => productId },
      variantId: { toString: () => variantId },
      quantity: 1,
      personalization: "",
      addedAt: new Date(),
    });

    await expect(
      updateCartItem("customer-1", { itemId, quantity: 6 }),
    ).rejects.toThrow("exceeds current stock");
    expect(mocks.updateCartItemQuantityRecord).not.toHaveBeenCalled();
  });

  it("builds fresh server totals and blocks checkout for excessive stock", async () => {
    mocks.getCartItemsRecord.mockResolvedValue([
      {
        _id: { toString: () => itemId },
        productId: { toString: () => productId },
        variantId: { toString: () => variantId },
        quantity: 6,
        personalization: "",
        addedAt: new Date(),
      },
    ]);
    mocks.listProductsForCart.mockResolvedValue([variant()]);

    const cart = await getCart("customer-1");

    expect(cart.subtotalAmount).toBe(0);
    expect(cart.canCheckout).toBe(false);
    expect(cart.items[0].issue).toBe("QUANTITY_EXCEEDS_STOCK");
  });
});
