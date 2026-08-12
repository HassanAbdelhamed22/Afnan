import { describe, expect, it } from "vitest";

import {
  calculateCartSubtotal,
  calculateLineTotal,
  normalizePersonalization,
} from "@/modules/cart/domain";

describe("cart domain rules", () => {
  it("normalizes personalization for stable cart item identity", () => {
    expect(normalizePersonalization("  Afnan   اسم  ")).toBe("Afnan اسم");
    expect(normalizePersonalization()).toBe("");
  });

  it("calculates integer line totals", () => {
    expect(calculateLineTotal(12550, 3)).toBe(37650);
  });

  it("rejects invalid money and quantity inputs", () => {
    expect(() => calculateLineTotal(12.5, 1)).toThrow();
    expect(() => calculateLineTotal(100, 0)).toThrow();
  });

  it("excludes unavailable lines from the current subtotal", () => {
    expect(
      calculateCartSubtotal([
        { unitPriceAmount: 10000, quantity: 2, available: true },
        { unitPriceAmount: 50000, quantity: 1, available: false },
      ]),
    ).toBe(20000);
  });
});
