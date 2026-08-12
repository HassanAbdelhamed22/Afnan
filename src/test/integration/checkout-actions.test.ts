import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireVerifiedUser: vi.fn(), createOrderFromCart: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/modules/auth/dal", () => ({ requireVerifiedUser: mocks.requireVerifiedUser }));
vi.mock("@/modules/checkout/service", () => ({ createOrderFromCart: mocks.createOrderFromCart }));

import { placeOrderAction } from "@/modules/checkout/actions";

const input = { addressId: "507f1f77bcf86cd799439011", checkoutToken: "550e8400-e29b-41d4-a716-446655440000", paymentMethod: "CASH_ON_DELIVERY" };
const session = { user: { id: "customer-1", name: "Afnan", email: "a@example.com", phoneE164: "+201012345678", whatsappE164: "+201012345678" } };

describe("checkout action", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.requireVerifiedUser.mockResolvedValue(session); mocks.createOrderFromCart.mockResolvedValue("AF-20260812-ABC123"); });

  it("authenticates before returning validation errors", async () => {
    const result = await placeOrderAction({});
    expect(mocks.requireVerifiedUser).toHaveBeenCalledOnce();
    expect(mocks.createOrderFromCart).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });

  it("uses server session customer data and revalidates private pages", async () => {
    const result = await placeOrderAction(input);
    expect(mocks.createOrderFromCart).toHaveBeenCalledWith(expect.objectContaining({ id: "customer-1", email: "a@example.com" }), input);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/cart");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/account/orders");
    expect(result).toMatchObject({ ok: true, data: { orderNumber: "AF-20260812-ABC123" } });
  });
});
