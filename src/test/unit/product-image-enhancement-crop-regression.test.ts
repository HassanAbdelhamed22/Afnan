import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connect: vi.fn(), fetch: vi.fn(), logError: vi.fn() }));

vi.mock("@/lib/env", () => ({ env: { APP_ENV: "test", CLOUDINARY_CLOUD_NAME: "test-cloud", CLOUDINARY_API_KEY: "test-key", CLOUDINARY_API_SECRET: "test-secret" } }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connect }));
vi.mock("@/lib/logger", () => ({ logger: { error: mocks.logError } }));
vi.mock("@/modules/uploads/paths", () => ({ isOwnedUploadPublicId: vi.fn(() => true), isProductImagePublicId: vi.fn(() => true) }));
vi.mock("@/modules/uploads/model", () => ({ UploadIntentModel: {} }));

import { requestProductImageEnhancement } from "@/modules/products/image-service";
import { ProductModel } from "@/modules/products/model";

describe("product background-removal crop regression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.connect.mockResolvedValue({});
  });

  it("preserves an existing Mongoose crop subdocument while changing enhancement state", async () => {
    const product = new ProductModel({
      name: "Woven basket", slug: "woven-basket", description: "A handmade woven basket with a natural finish.",
      categoryId: new Types.ObjectId(), status: "DRAFT", fulfillmentType: "READY_MADE", basePriceAmount: 10000, currency: "EGP",
      materials: [], colors: [], tags: [], personalizationAvailable: false, isFeatured: false,
      variants: [{ sku: "BASKET-1", label: "Default", optionValues: new Map([["style", "Default"]]), stockQuantity: 1, isActive: true }],
      images: [{
        url: "https://res.cloudinary.com/test-cloud/image/upload/v1/afnan/test/products/admin/image.png",
        publicId: "afnan/test/products/admin/image", width: 1200, height: 1500, bytes: 1000, format: "png", alt: "Woven basket", sortOrder: 0, isPrimary: true,
        presentation: { source: "ORIGINAL", backgroundRemovalRequested: false, backgroundRemovalStatus: "NOT_REQUESTED", enhancedApproved: false, backgroundColor: "#F7F7F5", aspectRatio: "4:5", fitMode: "COVER", crop: { x: 10, y: 5, width: 80, height: 90 } },
      }],
    });
    const originalCrop = product.images[0].presentation?.crop;
    vi.spyOn(ProductModel, "findById").mockResolvedValue(product);
    vi.spyOn(product, "save").mockImplementation(async () => {
      await product.validate();
      return product;
    });
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify({ eager: [{ secure_url: "https://res.cloudinary.com/test-cloud/image/upload/e_background_removal/v1/afnan/test/products/admin/image.png" }] }), { status: 200 }));

    await expect(requestProductImageEnhancement(product._id.toString(), product.images[0].publicId)).resolves.toMatchObject({ id: product._id.toString() });
    expect(product.images[0].presentation?.crop).toBe(originalCrop);
    expect(product.images[0].presentation?.backgroundRemovalStatus).toBe("READY");
    await expect(product.validate()).resolves.toBeUndefined();
    expect(mocks.logError).not.toHaveBeenCalled();
  });
});
