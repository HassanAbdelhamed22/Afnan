import { describe, expect, it } from "vitest";

import { buildAttachedCategoryImage } from "@/modules/categories/image-mapping";
import type { MediaAsset } from "@/modules/uploads/types";

describe("category image mapping", () => {
  it("copies provider fields from a Mongoose-like subdocument without its internals", () => {
    const values: MediaAsset = { url: "https://res.cloudinary.com/afnan/image/upload/category.png", publicId: "afnan/test/categories/admin-1/category", width: 900, height: 900, bytes: 1800, format: "png" };
    const mongooseLikeAsset = { $__: {}, _doc: values } as unknown as MediaAsset;
    for (const [key, value] of Object.entries(values)) Object.defineProperty(mongooseLikeAsset, key, { get: () => value });

    const image = buildAttachedCategoryImage(mongooseLikeAsset, "Woven basket collection");

    expect(image).toMatchObject({ ...values, alt: "Woven basket collection", sortOrder: 0, isPrimary: true });
    expect(image).not.toHaveProperty("$__");
    expect(image).not.toHaveProperty("_doc");
  });
});
