import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  addCartItem: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/modules/auth/dal", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/modules/cart/service", () => ({
  addCartItem: mocks.addCartItem,
  updateCartItem: mocks.updateCartItem,
  removeCartItem: mocks.removeCartItem,
  clearCart: mocks.clearCart,
}));

import {
  addToCartAction,
  clearCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/modules/cart/actions";

const productId = "507f1f77bcf86cd799439011";
const variantId = "507f191e810c19729de860ea";
const itemId = "65af191e810c19729de860ea";

describe("cart actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ user: { id: "customer-1" } });
    const cart = { itemCount: 2 };
    mocks.addCartItem.mockResolvedValue(cart);
    mocks.updateCartItem.mockResolvedValue(cart);
    mocks.removeCartItem.mockResolvedValue(cart);
    mocks.clearCart.mockResolvedValue({ itemCount: 0 });
  });

  it("authenticates before returning validation errors", async () => {
    const result = await addToCartAction({});

    expect(mocks.requireUser).toHaveBeenCalledOnce();
    expect(mocks.addCartItem).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it("scopes every cart mutation to the authenticated user", async () => {
    await addToCartAction({ productId, variantId, quantity: 2 });
    await updateCartItemAction({ itemId, quantity: 3 });
    await removeCartItemAction({ itemId });
    await clearCartAction();

    expect(mocks.addCartItem).toHaveBeenCalledWith("customer-1", {
      productId,
      variantId,
      quantity: 2,
    });
    expect(mocks.updateCartItem).toHaveBeenCalledWith("customer-1", {
      itemId,
      quantity: 3,
    });
    expect(mocks.removeCartItem).toHaveBeenCalledWith("customer-1", itemId);
    expect(mocks.clearCart).toHaveBeenCalledWith("customer-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/cart");
  });
});
