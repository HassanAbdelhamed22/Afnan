import { describe, expect, it } from "vitest";

import { buildAttachedProductImage } from "@/modules/products/image-mapping";
import type { MediaAsset } from "@/modules/uploads/types";

describe("product image mapping", () => {
  it("copies required fields from a Mongoose-like subdocument without spreading its internals", () => {
    const values: MediaAsset = {
      url: "https://res.cloudinary.com/afnan/image/upload/asset.png",
      publicId: "afnan/development/products/admin-1/asset",
      width: 800,
      height: 1000,
      bytes: 1500,
      format: "png",
    };
    const mongooseLikeAsset = { $__: {}, _doc: values } as unknown as MediaAsset;
    for (const [key, value] of Object.entries(values)) {
      Object.defineProperty(mongooseLikeAsset, key, { get: () => value });
    }

    const image = buildAttachedProductImage(mongooseLikeAsset, "Handmade bag", 0);

    expect(image).toMatchObject({ ...values, alt: "Handmade bag", sortOrder: 0, isPrimary: true });
    expect(image).not.toHaveProperty("$__");
    expect(image).not.toHaveProperty("_doc");
  });
});
