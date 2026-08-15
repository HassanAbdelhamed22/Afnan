import { describe, expect, it } from "vitest";

import { createUploadIntentSchema } from "@/modules/uploads/schemas";
import { resolveMediaUrl, type MediaAsset } from "@/modules/uploads/types";

const original: MediaAsset = { url: "https://res.cloudinary.com/demo/image/upload/original.png", publicId: "afnan/test/products/admin/image", enhancedUrl: "https://res.cloudinary.com/demo/image/upload/e_background_removal/original.png" };

describe("product image presentation", () => {
  it("uses enhanced media only when ready and explicitly approved", () => {
    expect(resolveMediaUrl({ ...original, presentation: { source: "ENHANCED", backgroundRemovalRequested: true, backgroundRemovalStatus: "READY", enhancedApproved: true, backgroundColor: "#F7F7F5", aspectRatio: "4:5" } })).toBe(original.enhancedUrl);
    expect(resolveMediaUrl({ ...original, presentation: { source: "ENHANCED", backgroundRemovalRequested: true, backgroundRemovalStatus: "PROCESSING", enhancedApproved: true, backgroundColor: "#F7F7F5", aspectRatio: "4:5" } })).toBe(original.url);
    expect(resolveMediaUrl(original)).toBe(original.url);
  });

  it("keeps stricter custom-request upload limits while allowing product images up to 8 MB", () => {
    const payload = { filename: "large.webp", mimeType: "image/webp", sizeBytes: 7 * 1024 * 1024 };
    expect(createUploadIntentSchema.safeParse({ ...payload, purpose: "PRODUCT_IMAGE" }).success).toBe(true);
    expect(createUploadIntentSchema.safeParse({ ...payload, purpose: "CUSTOM_REQUEST_REFERENCE" }).success).toBe(false);
  });
});
