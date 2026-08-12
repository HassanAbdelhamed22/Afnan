import { describe, expect, it } from "vitest";

import { AddressModel } from "@/modules/users/model";

describe("address model indexes", () => {
  it("indexes customer address history and enforces one default per user", () => {
    const indexes = AddressModel.schema.indexes();

    expect(indexes).toContainEqual([
      { userId: 1, createdAt: -1 },
      expect.any(Object),
    ]);
    expect(indexes).toContainEqual([
      { userId: 1, isDefault: 1 },
      expect.objectContaining({
        unique: true,
        partialFilterExpression: { isDefault: true },
      }),
    ]);
  });
});
