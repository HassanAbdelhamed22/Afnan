import { describe, expect, it } from "vitest";

import { WishlistModel } from "@/modules/wishlist/model";

describe("wishlist model", () => {
  it("stores Better Auth user IDs as strings with one wishlist per user", () => {
    expect(WishlistModel.schema.path("userId").instance).toBe("String");
    expect(WishlistModel.schema.indexes()).toContainEqual([
      { userId: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });
});
