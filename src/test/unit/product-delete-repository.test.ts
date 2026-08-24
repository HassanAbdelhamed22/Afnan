import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connect: vi.fn(), findById: vi.fn(), deleteOne: vi.fn(), orderExists: vi.fn(),
  cartUpdateMany: vi.fn(), wishlistUpdateMany: vi.fn(),
}));

vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connect }));
vi.mock("@/modules/products/model", () => ({ ProductModel: { findById: mocks.findById, deleteOne: mocks.deleteOne } }));
vi.mock("@/modules/orders/model", () => ({ OrderModel: { exists: mocks.orderExists } }));
vi.mock("@/modules/cart/model", () => ({ CartModel: { updateMany: mocks.cartUpdateMany } }));
vi.mock("@/modules/wishlist/model", () => ({ WishlistModel: { updateMany: mocks.wishlistUpdateMany } }));
vi.mock("@/modules/categories/model", () => ({ CategoryModel: {} }));

import { deleteAdminProduct } from "@/modules/products/admin-repository";

const productId = new Types.ObjectId("507f1f77bcf86cd799439012");
const categoryId = new Types.ObjectId("507f1f77bcf86cd799439011");
const session = { withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()), endSession: vi.fn() };

function product(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  mocks.findById.mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: productId, slug: "linen-bag", categoryId, status }) }) });
}

describe("admin product removal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connect.mockResolvedValue({ startSession: vi.fn().mockResolvedValue(session) });
    mocks.orderExists.mockResolvedValue(null);
    mocks.deleteOne.mockReturnValue({ session: vi.fn().mockResolvedValue({ deletedCount: 1 }) });
    mocks.cartUpdateMany.mockResolvedValue({ modifiedCount: 1 });
    mocks.wishlistUpdateMany.mockResolvedValue({ modifiedCount: 1 });
  });

  it("requires an active product to be archived first", async () => {
    product("ACTIVE");
    await expect(deleteAdminProduct(productId.toString())).rejects.toThrow("Archive this product before removing it");
    expect(mocks.orderExists).not.toHaveBeenCalled();
    expect(mocks.deleteOne).not.toHaveBeenCalled();
  });

  it("preserves products referenced by immutable order snapshots", async () => {
    product("ARCHIVED");
    mocks.orderExists.mockResolvedValue({ _id: new Types.ObjectId() });
    await expect(deleteAdminProduct(productId.toString())).rejects.toThrow("appears in an order");
    expect(mocks.deleteOne).not.toHaveBeenCalled();
  });

  it("removes an unreferenced archived product and clears customer references transactionally", async () => {
    product("ARCHIVED");
    await expect(deleteAdminProduct(productId.toString())).resolves.toEqual({ id: productId.toString(), slug: "linen-bag", categoryId: categoryId.toString() });
    expect(session.withTransaction).toHaveBeenCalledOnce();
    expect(mocks.cartUpdateMany).toHaveBeenCalledWith({ "items.productId": productId }, { $pull: { items: { productId } } }, { session });
    expect(mocks.wishlistUpdateMany).toHaveBeenCalledWith({ "items.productId": productId }, { $pull: { items: { productId } } }, { session });
    expect(session.endSession).toHaveBeenCalledOnce();
  });
});
