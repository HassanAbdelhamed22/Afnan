import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  addWishlistItem: vi.fn(),
  removeWishlistItem: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/modules/auth/dal", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/modules/wishlist/service", () => ({
  addWishlistItem: mocks.addWishlistItem,
  removeWishlistItem: mocks.removeWishlistItem,
}));

import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/modules/wishlist/actions";

const productId = "507f1f77bcf86cd799439011";

describe("wishlist actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ user: { id: "customer-1" } });
    mocks.addWishlistItem.mockResolvedValue({ itemCount: 1 });
    mocks.removeWishlistItem.mockResolvedValue({ itemCount: 0 });
  });

  it("authenticates before returning validation errors", async () => {
    const result = await addToWishlistAction({});
    expect(mocks.requireUser).toHaveBeenCalledOnce();
    expect(mocks.addWishlistItem).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it("passes the authenticated user ID to add and remove operations", async () => {
    await addToWishlistAction({ productId });
    await removeFromWishlistAction({ productId });

    expect(mocks.addWishlistItem).toHaveBeenCalledWith("customer-1", productId);
    expect(mocks.removeWishlistItem).toHaveBeenCalledWith("customer-1", productId);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/account/wishlist");
  });
});
