import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ updateOne: vi.fn(), findOne: vi.fn(), connect: vi.fn() }));
const session = { withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()), endSession: vi.fn() };
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connect })); vi.mock("@/modules/products/model", () => ({ ProductModel: { updateOne: mocks.updateOne } })); vi.mock("@/modules/orders/model", () => ({ OrderModel: { findOne: mocks.findOne } }));
import { transitionAdminOrder } from "@/modules/orders/admin-service";
function order(stockRestored = false) { return { status: "CONFIRMED", stockRestored, items: [{ productId: { toString: () => "product-1" }, variantId: { toString: () => "variant-1" }, productSlug: "linen-bag", fulfillmentType: "READY_MADE", quantity: 2 }], statusHistory: [] as unknown[], save: vi.fn() }; }
describe("cancellation stock restoration", () => { beforeEach(() => { vi.clearAllMocks(); mocks.connect.mockResolvedValue({ startSession: vi.fn().mockResolvedValue(session) }); mocks.updateOne.mockResolvedValue({ modifiedCount: 1 }); });
  it("restores ready-made stock and records the order-level flag", async () => { const record = order(false); mocks.findOne.mockReturnValue({ session: vi.fn().mockResolvedValue(record) }); await transitionAdminOrder("AFN-1", "CANCELLED", "admin-1"); expect(mocks.updateOne).toHaveBeenCalledOnce(); expect(record.stockRestored).toBe(true); expect(record.status).toBe("CANCELLED"); });
  it("does not restore stock again when the idempotency flag is already set", async () => { const record = order(true); mocks.findOne.mockReturnValue({ session: vi.fn().mockResolvedValue(record) }); await transitionAdminOrder("AFN-1", "CANCELLED", "admin-1"); expect(mocks.updateOne).not.toHaveBeenCalled(); });
});
