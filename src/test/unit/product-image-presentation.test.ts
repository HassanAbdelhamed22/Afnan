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

  it("applies a validated non-destructive crop to the resolved Cloudinary URL", () => {
    const resolved = resolveMediaUrl({ ...original, width: 1000, height: 1000, presentation: { source: "ORIGINAL", backgroundRemovalRequested: false, backgroundRemovalStatus: "NOT_REQUESTED", enhancedApproved: false, backgroundColor: "#F7F7F5", aspectRatio: "4:5", fitMode: "COVER", crop: { x: 10, y: 0, width: 80, height: 100 } } });
    expect(resolved).toContain("/image/upload/c_crop,x_100,y_0,w_800,h_1000/");
    expect(original.url).toBe("https://res.cloudinary.com/demo/image/upload/original.png");
  });

  it("keeps the source URL intact for fit and stretch modes", () => {
    const basePresentation = { source: "ORIGINAL" as const, backgroundRemovalRequested: false, backgroundRemovalStatus: "NOT_REQUESTED" as const, enhancedApproved: false, backgroundColor: "#F7F7F5" as const, aspectRatio: "4:5" as const, crop: { x: 10, y: 0, width: 80, height: 100 } };
    expect(resolveMediaUrl({ ...original, width: 1000, height: 1000, presentation: { ...basePresentation, fitMode: "CONTAIN" } })).toBe(original.url);
    expect(resolveMediaUrl({ ...original, width: 1000, height: 1000, presentation: { ...basePresentation, fitMode: "STRETCH" } })).toBe(original.url);
  });

  it("keeps stricter custom-request upload limits while allowing product images up to 8 MB", () => {
    const payload = { filename: "large.webp", mimeType: "image/webp", sizeBytes: 7 * 1024 * 1024 };
    expect(createUploadIntentSchema.safeParse({ ...payload, purpose: "PRODUCT_IMAGE" }).success).toBe(true);
    expect(createUploadIntentSchema.safeParse({ ...payload, purpose: "CUSTOM_REQUEST_REFERENCE" }).success).toBe(false);
  });
});
