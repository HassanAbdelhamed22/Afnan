import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connectMongoose: vi.fn(), countDocuments: vi.fn(), create: vi.fn(), findOne: vi.fn(), updateOne: vi.fn(), deleteOne: vi.fn() }));
vi.mock("@/lib/env", () => ({ env: { APP_ENV: "test", CLOUDINARY_CLOUD_NAME: "afnan-cloud", CLOUDINARY_API_KEY: "key", CLOUDINARY_API_SECRET: "secret" } }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/uploads/model", () => ({ UploadIntentModel: { countDocuments: mocks.countDocuments, create: mocks.create, findOne: mocks.findOne, updateOne: mocks.updateOne, deleteOne: mocks.deleteOne } }));

import { completeUploadIntent, createUploadIntent, discardUploadIntent } from "@/modules/uploads/service";

describe("secure upload intents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.countDocuments.mockResolvedValue(0);
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mocks.deleteOne.mockResolvedValue({ deletedCount: 1 });
    mocks.create.mockResolvedValue({ _id: { toString: () => "507f1f77bcf86cd799439011" } });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ public_id: "afnan/test/custom-requests/customer-1/asset", secure_url: "https://res.cloudinary.com/afnan-cloud/image/upload/v123/asset.png", width: 800, height: 1000, bytes: 1500, format: "png", resource_type: "image" }), { status: 200 })));
  });

  it("creates a short-lived owner-scoped signed upload", async () => {
    const result = await createUploadIntent("customer-1", { filename: "idea.png", mimeType: "image/png", sizeBytes: 1000 });
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ userId: "customer-1", purpose: "CUSTOM_REQUEST_REFERENCE", status: "PENDING", expiresAt: expect.any(Date) }));
    expect(result).toMatchObject({ cloudName: "afnan-cloud", apiKey: "key", intentId: "507f1f77bcf86cd799439011", folder: "afnan/test/custom-requests/customer-1" });
    expect(result.signature).toMatch(/^[a-f\d]{40}$/);
  });

  it("creates product uploads in the environment-scoped product folder", async () => {
    const result = await createUploadIntent("admin-1", { filename: "product.png", mimeType: "image/png", sizeBytes: 1000, purpose: "PRODUCT_IMAGE" });

    expect(result.folder).toBe("afnan/test/products/admin-1");
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ userId: "admin-1", purpose: "PRODUCT_IMAGE", publicId: expect.stringMatching(/^afnan\/test\/products\/admin-1\//) }));
  });

  it("creates category uploads in a separate admin folder", async () => {
    const result = await createUploadIntent("admin-1", { filename: "category.webp", mimeType: "image/webp", sizeBytes: 1000, purpose: "CATEGORY_IMAGE" });

    expect(result.folder).toBe("afnan/test/categories/admin-1");
  });

  it("verifies Cloudinary completion under the authenticated owner", async () => {
    const publicId = "afnan/test/custom-requests/customer-1/asset";
    const signature = createHash("sha1").update(`public_id=${publicId}&version=123secret`).digest("hex");
    const intent = { publicId, sizeBytes: 2000, status: "PENDING", asset: undefined, _id: { toString: () => "507f1f77bcf86cd799439011" }, save: vi.fn() };
    mocks.findOne.mockResolvedValue(intent);
    await completeUploadIntent("customer-1", { intentId: "507f1f77bcf86cd799439011", publicId, version: 123, signature });
    expect(mocks.findOne).toHaveBeenCalledWith(expect.objectContaining({ userId: "customer-1", status: "PENDING" }));
    expect(intent.status).toBe("COMPLETED");
    expect(intent.save).toHaveBeenCalledOnce();
  });

  it("deletes an unclaimed managed upload with a signed Cloudinary destroy request", async () => {
    const intent = { _id: "507f1f77bcf86cd799439011", userId: "admin-1", purpose: "CATEGORY_IMAGE", status: "COMPLETED", publicId: "afnan/test/categories/admin-1/asset" };
    mocks.findOne.mockResolvedValue(intent);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ result: "ok" }), { status: 200 })));

    await expect(discardUploadIntent("admin-1", intent._id, "CATEGORY_IMAGE")).resolves.toBe(true);

    expect(mocks.updateOne).toHaveBeenNthCalledWith(1, expect.objectContaining({ _id: intent._id, status: "COMPLETED" }), { $set: { status: "DISCARDING" } });
    expect(fetch).toHaveBeenCalledWith("https://api.cloudinary.com/v1_1/afnan-cloud/image/destroy", expect.objectContaining({ method: "POST" }));
    expect(mocks.deleteOne).toHaveBeenCalledWith(expect.objectContaining({ _id: intent._id, status: "DISCARDING" }));
  });
});
