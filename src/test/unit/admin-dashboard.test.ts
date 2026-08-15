import { beforeEach, describe, expect, it, vi } from "vitest";

const { orderCountDocuments, requestCountDocuments, orderLean, requestLean } = vi.hoisted(() => ({
  orderCountDocuments: vi.fn(),
  requestCountDocuments: vi.fn(),
  orderLean: vi.fn(),
  requestLean: vi.fn(),
}));

function queryReturning(lean: typeof orderLean) {
  return {
    select: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean,
  };
}

vi.mock("@/lib/mongoose", () => ({ connectMongoose: vi.fn() }));
vi.mock("@/modules/orders/model", () => ({
  OrderModel: {
    countDocuments: orderCountDocuments,
    find: vi.fn(() => queryReturning(orderLean)),
  },
}));
vi.mock("@/modules/custom-requests/model", () => ({
  CustomRequestModel: {
    countDocuments: requestCountDocuments,
    find: vi.fn(() => queryReturning(requestLean)),
  },
}));

import { getAdminDashboard } from "@/modules/admin/dashboard";
import { CustomRequestModel } from "@/modules/custom-requests/model";
import { OrderModel } from "@/modules/orders/model";

describe("admin dashboard query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderCountDocuments
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(9);
    requestCountDocuments.mockResolvedValueOnce(4);
    orderLean.mockResolvedValueOnce([
      {
        orderNumber: "AF-100",
        customerSnapshot: { name: "Mona" },
        status: "CONFIRMED",
        totalAmount: 125000,
        createdAt: new Date("2026-08-15T09:00:00.000Z"),
      },
    ]);
    requestLean.mockResolvedValueOnce([
      {
        requestNumber: "CR-100",
        title: "Custom basket",
        customerSnapshot: { name: "Salma" },
        status: "SUBMITTED",
        createdAt: new Date("2026-08-15T10:00:00.000Z"),
      },
    ]);
  });

  it("returns operational counts and safe recent-record DTOs", async () => {
    const dashboard = await getAdminDashboard();

    expect(dashboard.counts).toEqual({
      pendingOrders: 3,
      activeOrders: 5,
      deliveredOrders: 9,
      openCustomRequests: 4,
    });
    expect(dashboard.recentOrders[0]).toEqual({
      orderNumber: "AF-100",
      customerName: "Mona",
      status: "CONFIRMED",
      totalAmount: 125000,
      createdAt: "2026-08-15T09:00:00.000Z",
    });
    expect(dashboard.recentCustomRequests[0]?.customerName).toBe("Salma");
    expect(OrderModel.find).toHaveBeenCalledWith({});
    expect(CustomRequestModel.find).toHaveBeenCalledWith({});
  });
});
