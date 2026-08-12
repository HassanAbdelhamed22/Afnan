import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connectMongoose: vi.fn(), orderFindOne: vi.fn(), invalidatePurchasedProductCaches: vi.fn() }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/orders/model", () => ({ OrderModel: { findOne: mocks.orderFindOne } }));
vi.mock("@/modules/users/model", () => ({ AddressModel: {} }));
vi.mock("@/modules/cart/model", () => ({ CartModel: {} }));
vi.mock("@/modules/products/model", () => ({ ProductModel: {} }));
vi.mock("@/modules/categories/model", () => ({ CategoryModel: {} }));
vi.mock("@/modules/shipping/model", () => ({ ShippingRateModel: {} }));
vi.mock("@/modules/email", () => ({ sendNewOrderAdminEmail: vi.fn() }));
vi.mock("@/modules/checkout/cache", () => ({ invalidatePurchasedProductCaches: mocks.invalidatePurchasedProductCaches }));

import { createOrderFromCart } from "@/modules/checkout/service";

const input = { addressId: "507f1f77bcf86cd799439011", checkoutToken: "550e8400-e29b-41d4-a716-446655440000", paymentMethod: "CASH_ON_DELIVERY" as const };
const customer = { id: "customer-1", name: "Afnan", email: "a@example.com", phoneE164: "+201012345678", whatsappE164: "+201012345678" };

function existingResult(value: unknown) { return { select: vi.fn(() => ({ lean: vi.fn(async () => value) })) }; }

describe("checkout idempotency", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.connectMongoose.mockResolvedValue({ startSession: vi.fn() }); });

  it("returns the existing owned order for a repeated checkout token", async () => {
    mocks.orderFindOne.mockReturnValue(existingResult({ orderNumber: "AF-EXISTING" }));
    await expect(createOrderFromCart(customer, input)).resolves.toBe("AF-EXISTING");
    expect(mocks.invalidatePurchasedProductCaches).not.toHaveBeenCalled();
  });

  it("requires a customer phone before starting a new transaction", async () => {
    mocks.orderFindOne.mockReturnValue(existingResult(null));
    await expect(createOrderFromCart({ ...customer, phoneE164: undefined }, input)).rejects.toThrow("Add a phone number");
  });
});
