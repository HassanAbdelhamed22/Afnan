import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectMongoose: vi.fn(),
  categoryFindById: vi.fn(),
  intentFindOne: vi.fn(),
  intentUpdateOne: vi.fn(),
  deleteManagedUploadAsset: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env: { APP_ENV: "test" } }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/categories/model", () => ({ CategoryModel: { findById: mocks.categoryFindById } }));
vi.mock("@/modules/uploads/model", () => ({ UploadIntentModel: { findOne: mocks.intentFindOne, updateOne: mocks.intentUpdateOne } }));
vi.mock("@/modules/uploads/service", () => ({ deleteManagedUploadAsset: mocks.deleteManagedUploadAsset }));

import { attachCategoryImage } from "@/modules/categories/image-service";

describe("category image service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const session = { withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()), endSession: vi.fn() };
    mocks.connectMongoose.mockResolvedValue({ startSession: vi.fn(async () => session) });
    mocks.intentUpdateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.deleteManagedUploadAsset.mockResolvedValue(true);
  });

  it("claims an owner-scoped category upload and replaces the prior managed image", async () => {
    const category = { _id: { toString: () => "507f1f77bcf86cd799439012" }, slug: "woven-baskets", image: { publicId: "afnan/test/categories/admin-1/old" }, save: vi.fn() };
    const assetValues = { url: "https://res.cloudinary.com/afnan/image/upload/new.png", publicId: "afnan/test/categories/admin-1/new", width: 900, height: 900, bytes: 1800, format: "png" as const };
    const asset = { _doc: assetValues } as unknown as typeof assetValues;
    for (const [key, value] of Object.entries(assetValues)) Object.defineProperty(asset, key, { get: () => value });
    const intent = { _id: "507f1f77bcf86cd799439013", asset };
    mocks.categoryFindById.mockReturnValue({ session: vi.fn(async () => category) });
    mocks.intentFindOne.mockReturnValue({ session: vi.fn(async () => intent) });

    await expect(attachCategoryImage("admin-1", category._id.toString(), intent._id, "Woven basket collection")).resolves.toEqual({ id: category._id.toString(), slug: category.slug });

    expect(mocks.intentFindOne).toHaveBeenCalledWith(expect.objectContaining({ userId: "admin-1", purpose: "CATEGORY_IMAGE", status: "COMPLETED" }));
    expect(category.image).toMatchObject({ ...assetValues, alt: "Woven basket collection", isPrimary: true });
    expect(category.save).toHaveBeenCalledOnce();
    expect(mocks.deleteManagedUploadAsset).toHaveBeenCalledWith("afnan/test/categories/admin-1/old", "CATEGORY_IMAGE");
  });
});
