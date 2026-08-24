import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connect: vi.fn(), findById: vi.fn(), logError: vi.fn(), fetch: vi.fn() }));

vi.mock("@/lib/env", () => ({ env: { APP_ENV: "test", CLOUDINARY_CLOUD_NAME: "test-cloud", CLOUDINARY_API_KEY: "secret-api-key", CLOUDINARY_API_SECRET: "secret-api-secret" } }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connect }));
vi.mock("@/lib/logger", () => ({ logger: { error: mocks.logError } }));
vi.mock("@/modules/uploads/paths", () => ({ isOwnedUploadPublicId: vi.fn(() => true), isProductImagePublicId: vi.fn(() => true) }));
vi.mock("@/modules/uploads/model", () => ({ UploadIntentModel: {} }));
vi.mock("@/modules/products/model", () => ({ ProductModel: { findById: mocks.findById } }));

import { requestProductImageEnhancement } from "@/modules/products/image-service";

describe("Cloudinary background-removal logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    mocks.connect.mockResolvedValue({});
  });

  it("logs a safe structured provider error and keeps it out of the client error", async () => {
    const productId = new Types.ObjectId().toString();
    const save = vi.fn().mockResolvedValue(undefined);
    const product = {
      _id: new Types.ObjectId(productId), slug: "woven-basket", categoryId: new Types.ObjectId(), save,
      images: [{ publicId: "afnan/test/products/admin/image", url: "https://res.cloudinary.com/test-cloud/image/upload/v1/afnan/test/products/admin/image.png", presentation: { fitMode: "CONTAIN", backgroundRemovalStatus: undefined as "FAILED" | undefined } }],
    };
    mocks.findById.mockResolvedValue(product);
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify({ error: { message: "Background removal add-on is not enabled; key=secret-api-key" } }), { status: 403, statusText: "Forbidden", headers: { "x-request-id": "cloudinary-request-1" } }));

    await expect(requestProductImageEnhancement(productId, product.images[0].publicId)).rejects.toThrow("Background removal failed; the original image remains available");

    expect(mocks.logError).toHaveBeenCalledWith("cloudinary_background_removal_failed", expect.objectContaining({
      productId,
      assetFingerprint: expect.stringMatching(/^[a-f0-9]{12}$/),
      stage: "provider_response",
      errorName: "CloudinaryRequestError",
      providerStatus: 403,
      providerRequestId: "cloudinary-request-1",
      providerMessage: "Background removal add-on is not enabled; key=[REDACTED]",
    }));
    expect(JSON.stringify(mocks.logError.mock.calls)).not.toContain("secret-api-key");
    expect(JSON.stringify(mocks.logError.mock.calls)).not.toContain("secret-api-secret");
    expect(product.images[0].presentation.backgroundRemovalStatus).toBe("FAILED");
  });

  it("logs validation paths when the processing state cannot be saved", async () => {
    const productId = new Types.ObjectId().toString();
    const validationError = Object.assign(new Error("unsafe validation detail"), {
      name: "ValidationError",
      errors: {
        format: { path: "images.0.format", kind: "enum", value: "unsupported" },
        crop: { path: "images.0.presentation.crop.width", kind: "max", value: 120 },
      },
    });
    const product = {
      _id: new Types.ObjectId(productId), slug: "woven-basket", categoryId: new Types.ObjectId(), save: vi.fn().mockRejectedValue(validationError),
      images: [{ publicId: "afnan/test/products/admin/image", url: "https://res.cloudinary.com/test-cloud/image/upload/v1/afnan/test/products/admin/image.png", presentation: { fitMode: "CONTAIN" } }],
    };
    mocks.findById.mockResolvedValue(product);

    await expect(requestProductImageEnhancement(productId, product.images[0].publicId)).rejects.toThrow("Product image data could not be prepared for background removal");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.logError).toHaveBeenCalledWith("product_image_enhancement_state_save_failed", {
      productId,
      assetFingerprint: expect.stringMatching(/^[a-f0-9]{12}$/),
      stage: "processing_state_save",
      errorName: "ValidationError",
      validationIssues: "images.0.format:enum,images.0.presentation.crop.width:max",
    });
    expect(JSON.stringify(mocks.logError.mock.calls)).not.toContain("unsafe validation detail");
    expect(JSON.stringify(mocks.logError.mock.calls)).not.toContain("unsupported");
  });

  it("does not mark an image ready when Cloudinary omits the eager preview", async () => {
    const productId = new Types.ObjectId().toString();
    const save = vi.fn().mockResolvedValue(undefined);
    const product = {
      _id: new Types.ObjectId(productId), slug: "woven-basket", categoryId: new Types.ObjectId(), save,
      images: [{ publicId: "afnan/test/products/admin/image", url: "https://res.cloudinary.com/test-cloud/image/upload/v1/afnan/test/products/admin/image.png", presentation: { fitMode: "CONTAIN", backgroundRemovalStatus: undefined as "FAILED" | undefined } }],
    };
    mocks.findById.mockResolvedValue(product);
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify({ public_id: product.images[0].publicId }), { status: 200, headers: { "x-request-id": "cloudinary-request-2" } }));

    await expect(requestProductImageEnhancement(productId, product.images[0].publicId)).rejects.toThrow("Background removal failed; the original image remains available");
    expect(product.images[0].presentation.backgroundRemovalStatus).toBe("FAILED");
    expect(mocks.logError).toHaveBeenCalledWith("cloudinary_background_removal_failed", expect.objectContaining({
      providerStatus: 200,
      providerRequestId: "cloudinary-request-2",
      providerMessage: "Cloudinary did not return the generated background-removal preview",
    }));
  });
});
