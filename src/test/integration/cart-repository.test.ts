import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";

const mocks = vi.hoisted(() => ({
  connectMongoose: vi.fn(),
  findOne: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/cart/model", () => ({
  CartModel: { findOne: mocks.findOne, updateOne: mocks.updateOne },
}));

import {
  addCartItemRecord,
  removeCartItemRecord,
  updateCartItemQuantityRecord,
} from "@/modules/cart/repository";

const productId = "507f1f77bcf86cd799439011";
const variantId = "507f191e810c19729de860ea";
const itemId = "65af191e810c19729de860ea";

describe("cart repository ownership and atomic updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connectMongoose.mockResolvedValue(undefined);
  });

  it("merges matching lines with an atomic stock ceiling", async () => {
    mocks.updateOne
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 0 })
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

    await addCartItemRecord({
      userId: "customer-1",
      productId,
      variantId,
      quantity: 2,
      personalization: "AF",
      maximumQuantity: 5,
    });

    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      2,
      {
        userId: "customer-1",
        items: {
          $elemMatch: {
            productId: expect.any(Types.ObjectId),
            variantId: expect.any(Types.ObjectId),
            personalization: "AF",
            quantity: { $lte: 3 },
          },
        },
      },
      { $inc: { "items.$[item].quantity": 2 } },
      expect.anything(),
    );
  });

  it("uses userId in update and removal filters", async () => {
    mocks.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    await updateCartItemQuantityRecord("customer-1", itemId, 4);
    await removeCartItemRecord("customer-1", itemId);

    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      1,
      { userId: "customer-1", "items._id": expect.any(Types.ObjectId) },
      { $set: { "items.$.quantity": 4 } },
    );
    expect(mocks.updateOne).toHaveBeenNthCalledWith(
      2,
      { userId: "customer-1", "items._id": expect.any(Types.ObjectId) },
      { $pull: { items: { _id: expect.any(Types.ObjectId) } } },
    );
  });

  it("continues when a concurrent first mutation wins cart creation", async () => {
    mocks.updateOne
      .mockRejectedValueOnce({ code: 11000 })
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

    await expect(
      addCartItemRecord({
        userId: "customer-1",
        productId,
        variantId,
        quantity: 1,
        personalization: "",
      }),
    ).resolves.toBeUndefined();
  });

  it("retries the increment when another request inserts the same line", async () => {
    mocks.updateOne
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 0 })
      .mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 })
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 0 })
      .mockResolvedValueOnce({ matchedCount: 1, modifiedCount: 1 });

    await expect(
      addCartItemRecord({
        userId: "customer-1",
        productId,
        variantId,
        quantity: 1,
        personalization: "",
        maximumQuantity: 4,
      }),
    ).resolves.toBeUndefined();

    expect(mocks.updateOne).toHaveBeenCalledTimes(4);
  });
});
