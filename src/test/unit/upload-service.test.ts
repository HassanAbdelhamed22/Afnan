import { createHash } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connectMongoose: vi.fn(), countDocuments: vi.fn(), create: vi.fn(), findOne: vi.fn() }));
vi.mock("@/lib/env", () => ({ env: { CLOUDINARY_CLOUD_NAME: "afnan-cloud", CLOUDINARY_API_KEY: "key", CLOUDINARY_API_SECRET: "secret" } }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/uploads/model", () => ({ UploadIntentModel: { countDocuments: mocks.countDocuments, create: mocks.create, findOne: mocks.findOne } }));

import { completeUploadIntent, createUploadIntent } from "@/modules/uploads/service";

describe("secure upload intents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.countDocuments.mockResolvedValue(0);
    mocks.create.mockResolvedValue({ _id: { toString: () => "507f1f77bcf86cd799439011" } });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ public_id: "afnan/test/custom-requests/customer-1/asset", secure_url: "https://res.cloudinary.com/afnan-cloud/image/upload/v123/asset.png", width: 800, height: 1000, bytes: 1500, format: "png", resource_type: "image" }), { status: 200 })));
  });

  it("creates a short-lived owner-scoped signed upload", async () => {
    const result = await createUploadIntent("customer-1", { filename: "idea.png", mimeType: "image/png", sizeBytes: 1000 });
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ userId: "customer-1", purpose: "CUSTOM_REQUEST_REFERENCE", status: "PENDING", expiresAt: expect.any(Date) }));
    expect(result).toMatchObject({ cloudName: "afnan-cloud", apiKey: "key", intentId: "507f1f77bcf86cd799439011" });
    expect(result.signature).toMatch(/^[a-f\d]{40}$/);
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
});
