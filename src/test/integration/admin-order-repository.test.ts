import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connectMongoose: vi.fn(), findOne: vi.fn() }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/orders/model", () => ({ OrderModel: { findOne: mocks.findOne } }));

import { getAdminOrderByNumber } from "@/modules/orders/admin-repository";

describe("admin order repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an empty status history for legacy orders without the field", async () => {
    const order = {
      _id: { toString: () => "order-1" },
      orderNumber: "AF-20260812-EC803F",
      status: "PENDING_CONFIRMATION",
      whatsappConfirmationStatus: "NOT_CONTACTED",
      paymentMethod: "CASH_ON_DELIVERY",
      customerSnapshot: { name: "Customer", email: "customer@example.com", phoneE164: "+201012345678", whatsappE164: "+201012345678" },
      addressSnapshot: { recipientName: "Customer", phoneE164: "+201012345678", governorateCode: "cairo", governorateName: "Cairo", city: "Nasr City", street: "Street 1", building: "2", floor: "3", apartment: "4" },
      items: [],
      subtotalAmount: 10_000,
      shippingFeeAmount: 5_000,
      totalAmount: 15_000,
      currency: "EGP",
      stockRestored: false,
      createdAt: new Date("2026-08-12T12:00:00.000Z"),
    };
    mocks.findOne.mockReturnValue({ select: vi.fn(() => ({ lean: vi.fn(async () => order) })) });

    const result = await getAdminOrderByNumber(order.orderNumber);

    expect(result.statusHistory).toEqual([]);
  });
});
