import { describe, expect, it } from "vitest";

import { categoryAdminInputSchema } from "@/modules/categories/admin-schemas";
import { productAdminInputSchema } from "@/modules/products/admin-schemas";

const baseProduct = {
  name: "Handwoven linen bag", slug: "handwoven-linen-bag",
  description: "A carefully handwoven linen bag made by Egyptian artisans.",
  categoryId: "507f1f77bcf86cd799439011", status: "DRAFT" as const,
  fulfillmentType: "READY_MADE" as const, basePriceAmount: 12500,
  materials: ["Linen"], colors: ["Natural"], tags: ["Bag"],
  personalizationAvailable: false, variants: [{ sku: "BAG-001", label: "Default", optionValues: { Style: "Default" }, stockQuantity: 2, isActive: true }],
  isFeatured: false,
};

describe("admin catalog schemas", () => {
  it("requires stock for every ready-made variant", () => {
    const result = productAdminInputSchema.safeParse({ ...baseProduct, variants: [{ ...baseProduct.variants[0], stockQuantity: undefined }] });
    expect(result.success).toBe(false);
  });

  it("requires a valid preparation range for made-to-order products", () => {
    const invalid = productAdminInputSchema.safeParse({ ...baseProduct, fulfillmentType: "MADE_TO_ORDER", variants: [{ ...baseProduct.variants[0], stockQuantity: undefined }] });
    const valid = productAdminInputSchema.safeParse({ ...baseProduct, fulfillmentType: "MADE_TO_ORDER", preparationDaysMin: 4, preparationDaysMax: 8, variants: [{ ...baseProduct.variants[0], stockQuantity: undefined }] });
    expect(invalid.success).toBe(false);
    expect(valid.success).toBe(true);
  });

  it("rejects duplicate SKUs and unsafe slugs", () => {
    const result = productAdminInputSchema.safeParse({ ...baseProduct, slug: "Unsafe Slug", variants: [baseProduct.variants[0], { ...baseProduct.variants[0] }] });
    expect(result.success).toBe(false);
  });

  it("validates category ordering and slug format", () => {
    expect(categoryAdminInputSchema.safeParse({ name: "Textile Art", slug: "textile-art", sortOrder: 2, isActive: true }).success).toBe(true);
    expect(categoryAdminInputSchema.safeParse({ name: "Textile Art", slug: "$ne", sortOrder: -1, isActive: true }).success).toBe(false);
  });
});
