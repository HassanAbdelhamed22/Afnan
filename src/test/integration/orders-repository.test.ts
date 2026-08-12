import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connectMongoose: vi.fn(), findOne: vi.fn() }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/orders/model", () => ({ OrderModel: { findOne: mocks.findOne, find: vi.fn() } }));

import { getCustomerOrderByNumber } from "@/modules/orders/repository";

describe("customer order ownership", () => {
  beforeEach(() => vi.clearAllMocks());
  it("includes both user ID and order number in the lookup", async () => {
    mocks.findOne.mockReturnValue({ select: vi.fn(() => ({ lean: vi.fn(async () => null) })) });
    await expect(getCustomerOrderByNumber("customer-1", "AF-1")).rejects.toThrow("Order not found");
    expect(mocks.findOne).toHaveBeenCalledWith({ userId: "customer-1", orderNumber: "AF-1" });
  });
});
