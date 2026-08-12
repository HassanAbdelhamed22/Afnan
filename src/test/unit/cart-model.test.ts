import { describe, expect, it } from "vitest";

import { CartModel } from "@/modules/cart/model";

describe("cart model indexes", () => {
  it("enforces one cart per Better Auth user ID", () => {
    expect(CartModel.schema.path("userId").instance).toBe("String");
    expect(CartModel.schema.indexes()).toContainEqual([
      { userId: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });
});
