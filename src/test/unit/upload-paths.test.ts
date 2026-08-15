import { describe, expect, it } from "vitest";

import { buildUploadFolder, isOwnedUploadPublicId, isProductImagePublicId } from "@/modules/uploads/paths";

describe("upload paths", () => {
  it("builds environment- and owner-scoped folders", () => {
    expect(buildUploadFolder("production", "PRODUCT_IMAGE", "admin-1")).toBe("afnan/production/products/admin-1");
    expect(buildUploadFolder("production", "CATEGORY_IMAGE", "admin-1")).toBe("afnan/production/categories/admin-1");
    expect(buildUploadFolder("test", "CUSTOM_REQUEST_REFERENCE", "customer-1")).toBe("afnan/test/custom-requests/customer-1");
  });

  it("trusts only product uploads from the current environment and owner", () => {
    const publicId = "afnan/production/products/admin-1/asset-id";

    expect(isOwnedUploadPublicId(publicId, "production", "PRODUCT_IMAGE", "admin-1")).toBe(true);
    expect(isOwnedUploadPublicId(publicId, "test", "PRODUCT_IMAGE", "admin-1")).toBe(false);
    expect(isOwnedUploadPublicId(publicId, "production", "PRODUCT_IMAGE", "admin-2")).toBe(false);
    expect(isOwnedUploadPublicId("afnan/products/admin-1/asset-id", "production", "PRODUCT_IMAGE", "admin-1")).toBe(false);
  });

  it("recognizes current-environment product images for enhancement", () => {
    expect(isProductImagePublicId("afnan/production/products/admin-1/asset-id", "production")).toBe(true);
    expect(isProductImagePublicId("afnan/test/products/admin-1/asset-id", "production")).toBe(false);
    expect(isProductImagePublicId("afnan/production/custom-requests/admin-1/asset-id", "production")).toBe(false);
  });
});
