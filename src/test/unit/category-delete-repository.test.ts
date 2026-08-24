import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connect: vi.fn(), findById: vi.fn(), deleteOne: vi.fn(), productExists: vi.fn() }));

vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connect }));
vi.mock("@/modules/categories/model", () => ({ CategoryModel: { findById: mocks.findById, deleteOne: mocks.deleteOne } }));
vi.mock("@/modules/products/model", () => ({ ProductModel: { exists: mocks.productExists } }));

import { deleteAdminCategory } from "@/modules/categories/admin-repository";

const categoryId = new Types.ObjectId("507f1f77bcf86cd799439011");

function category(isActive: boolean) {
  mocks.findById.mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: categoryId, slug: "textile-art", isActive }) }) });
}

describe("admin category removal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productExists.mockResolvedValue(null);
    mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
  });

  it("requires the category to be archived", async () => {
    category(true);
    await expect(deleteAdminCategory(categoryId.toString())).rejects.toThrow("Archive this category before removing it");
    expect(mocks.productExists).not.toHaveBeenCalled();
  });

  it("preserves a category while any product references it", async () => {
    category(false);
    mocks.productExists.mockResolvedValue({ _id: new Types.ObjectId() });
    await expect(deleteAdminCategory(categoryId.toString())).rejects.toThrow("Move or remove every product");
    expect(mocks.deleteOne).not.toHaveBeenCalled();
  });

  it("removes an empty archived category", async () => {
    category(false);
    await expect(deleteAdminCategory(categoryId.toString())).resolves.toEqual({ id: categoryId.toString(), slug: "textile-art" });
    expect(mocks.deleteOne).toHaveBeenCalledWith({ _id: categoryId, isActive: false });
  });
});
