import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  updateUser: vi.fn(),
  createAddressRecord: vi.fn(),
  updateAddressRecord: vi.fn(),
  deleteAddressRecord: vi.fn(),
  setDefaultAddressRecord: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/auth/dal", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/auth/auth", () => ({ auth: { api: { updateUser: mocks.updateUser } } }));
vi.mock("@/modules/users/repository", () => ({
  createAddressRecord: mocks.createAddressRecord,
  updateAddressRecord: mocks.updateAddressRecord,
  deleteAddressRecord: mocks.deleteAddressRecord,
  setDefaultAddressRecord: mocks.setDefaultAddressRecord,
}));

import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
  updateProfileAction,
} from "@/modules/users/actions";

const session = {
  user: {
    id: "customer-1",
    name: "Old Name",
    email: "customer@example.com",
    emailVerified: true,
    phoneE164: "+201012345678",
    whatsappE164: "+201112345678",
    image: null,
  },
};

function validAddressForm() {
  const formData = new FormData();
  formData.set("label", "Home");
  formData.set("recipientName", "Afnan Customer");
  formData.set("phone", "01012345678");
  formData.set("governorateCode", "cairo");
  formData.set("city", "Nasr City");
  formData.set("street", "Makram Ebeid Street");
  formData.set("building", "12");
  formData.set("floor", "3");
  formData.set("apartment", "8");
  formData.set("isDefault", "on");
  return formData;
}

describe("customer profile and address actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue(session);
  });

  it("authenticates before returning address validation errors", async () => {
    const result = await saveAddressAction({ ok: true, data: null }, new FormData());

    expect(mocks.requireUser).toHaveBeenCalledOnce();
    expect(mocks.createAddressRecord).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.fieldErrors?.governorateCode).toEqual([
        "Select a governorate",
      ]);
      expect(result.error.fieldErrors?.label).not.toContain(
        "Invalid input: expected string, received null",
      );
    }
  });

  it("creates an address under the authenticated user ID", async () => {
    const storedAddress = { id: "507f1f77bcf86cd799439011" };
    mocks.createAddressRecord.mockResolvedValue(storedAddress);

    const result = await saveAddressAction({ ok: true, data: null }, validAddressForm());

    expect(mocks.createAddressRecord).toHaveBeenCalledWith(
      "customer-1",
      expect.objectContaining({
        phone: "+201012345678",
        governorateCode: "cairo",
        isDefault: true,
      }),
    );
    expect(result.ok).toBe(true);
  });

  it("passes both address and user IDs to ownership-protected mutations", async () => {
    const formData = new FormData();
    formData.set("addressId", "507f1f77bcf86cd799439011");

    await deleteAddressAction({ ok: true, data: {} }, formData);
    await setDefaultAddressAction({ ok: true, data: {} }, formData);

    expect(mocks.deleteAddressRecord).toHaveBeenCalledWith(
      "customer-1",
      "507f1f77bcf86cd799439011",
    );
    expect(mocks.setDefaultAddressRecord).toHaveBeenCalledWith(
      "customer-1",
      "507f1f77bcf86cd799439011",
    );
  });

  it("updates only allow-listed profile fields through Better Auth", async () => {
    mocks.updateUser.mockResolvedValue({ status: true });
    const formData = new FormData();
    formData.set("name", "Updated Customer");
    formData.set("phone", "01212345678");
    formData.set("whatsappPhone", "01512345678");

    const result = await updateProfileAction({ ok: true, data: null }, formData);

    expect(mocks.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          name: "Updated Customer",
          phoneE164: "+201212345678",
          whatsappE164: "+201512345678",
        },
      }),
    );
    expect(result.ok).toBe(true);
  });
});
