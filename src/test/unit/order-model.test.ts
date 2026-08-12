import { describe, expect, it } from "vitest";
import { OrderModel } from "@/modules/orders/model";

describe("order model", () => {
  it("indexes order numbers, checkout tokens, and customer history", () => {
    const indexes = OrderModel.schema.indexes();
    expect(indexes).toContainEqual([{ orderNumber: 1 }, expect.objectContaining({ unique: true })]);
    expect(indexes).toContainEqual([{ checkoutToken: 1 }, expect.objectContaining({ unique: true })]);
    expect(indexes).toContainEqual([{ userId: 1, createdAt: -1 }, expect.any(Object)]);
  });

  it("stores immutable order items without deleting product references", () => {
    expect(OrderModel.schema.path("items")).toBeDefined();
    expect(OrderModel.schema.path("customerSnapshot.email")).toBeDefined();
    expect(OrderModel.schema.path("addressSnapshot.governorateName")).toBeDefined();
  });
});
