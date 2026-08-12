import { describe, expect, it } from "vitest";
import { ShippingRateModel } from "@/modules/shipping/model";

describe("shipping rate model", () => {
  it("keeps one operational rate per Egyptian governorate code", () => {
    expect(ShippingRateModel.schema.indexes()).toContainEqual([
      { governorateCode: 1 },
      expect.objectContaining({ unique: true }),
    ]);
    expect(ShippingRateModel.schema.path("feeAmount").instance).toBe("Number");
  });
});
