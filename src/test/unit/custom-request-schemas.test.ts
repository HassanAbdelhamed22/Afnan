import { describe, expect, it } from "vitest";
import { customRequestSchema } from "@/modules/custom-requests/schemas";

const valid = { title: "Custom table runner", description: "A handmade linen runner with embroidered blue flowers.", material: "", colors: "Blue, Cream", dimensions: "40 x 120 cm", quantity: "2", desiredDate: "", budgetMinAmount: "500", budgetMaxAmount: "900", uploadIntentIds: [] };

describe("custom request validation", () => {
  it("normalizes colors and converts EGP to integer minor units", () => {
    const result = customRequestSchema.parse(valid);
    expect(result.colors).toEqual(["Blue", "Cream"]);
    expect(result.budgetMinAmount).toBe(50000);
    expect(result.budgetMaxAmount).toBe(90000);
    expect(result.material).toBeUndefined();
  });

  it("rejects an inverted budget range", () => {
    expect(customRequestSchema.safeParse({ ...valid, budgetMinAmount: "1000", budgetMaxAmount: "500" }).success).toBe(false);
  });

  it("limits reference images to five owned upload intents", () => {
    const ids = Array.from({ length: 6 }, (_, index) => `507f1f77bcf86cd7994390${String(index).padStart(2, "0")}`);
    expect(customRequestSchema.safeParse({ ...valid, uploadIntentIds: ids }).success).toBe(false);
  });
});
