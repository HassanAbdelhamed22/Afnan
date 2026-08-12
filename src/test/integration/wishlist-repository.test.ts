import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";

const mocks = vi.hoisted(() => ({
  connectMongoose: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/wishlist/model", () => ({
  WishlistModel: { updateOne: mocks.updateOne },
}));

import {
  addWishlistItemRecord,
  removeWishlistItemRecord,
} from "@/modules/wishlist/repository";

const productId = "507f1f77bcf86cd799439011";

describe("wishlist repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connectMongoose.mockResolvedValue(undefined);
    mocks.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  });

  it("uses an idempotent product filter when saving", async () => {
    await addWishlistItemRecord("customer-1", productId);

    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      2,
      { userId: "customer-1", "items.productId": { $ne: expect.any(Types.ObjectId) } },
      { $push: { items: { productId: expect.any(Types.ObjectId), addedAt: expect.any(Date) } } },
    );
  });

  it("includes userId in the removal filter", async () => {
    await removeWishlistItemRecord("customer-1", productId);

    expect(mocks.updateOne).toHaveBeenCalledWith(
      { userId: "customer-1" },
      { $pull: { items: { productId: expect.any(Types.ObjectId) } } },
    );
  });

  it("continues if another first save creates the unique wishlist", async () => {
    mocks.updateOne
      .mockRejectedValueOnce({ code: 11000 })
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

    await expect(addWishlistItemRecord("customer-1", productId)).resolves.toBeUndefined();
  });
});
