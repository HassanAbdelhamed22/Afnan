import { describe, expect, it } from "vitest";

import { addressInputSchema, profileInputSchema } from "@/modules/users/schemas";

describe("customer profile validation", () => {
  it("normalizes Egyptian phone and WhatsApp numbers", () => {
    const result = profileInputSchema.parse({
      name: "  Afnan Customer  ",
      phone: "010 1234 5678",
      whatsappPhone: "0020 11 1234 5678",
    });

    expect(result).toEqual({
      name: "Afnan Customer",
      phone: "+201012345678",
      whatsappPhone: "+201112345678",
    });
  });

  it("rejects a non-Egyptian mobile number", () => {
    const result = profileInputSchema.safeParse({
      name: "Afnan Customer",
      phone: "+15551234567",
      whatsappPhone: "01012345678",
    });

    expect(result.success).toBe(false);
  });
});

describe("Egyptian address validation", () => {
  const validAddress = {
    label: "Home",
    recipientName: "Afnan Customer",
    phone: "01012345678",
    governorateCode: "cairo",
    city: "Nasr City",
    area: "",
    street: "Makram Ebeid Street",
    building: "12",
    floor: "3",
    apartment: "8",
    landmark: "",
    notes: "",
    isDefault: true,
  };

  it("normalizes the phone and removes blank optional fields", () => {
    const result = addressInputSchema.parse(validAddress);

    expect(result.phone).toBe("+201012345678");
    expect(result.area).toBeUndefined();
    expect(result.landmark).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });

  it("accepts governorates outside the initial shipping-rate placeholders", () => {
    const result = addressInputSchema.safeParse({
      ...validAddress,
      governorateCode: "aswan",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown governorate", () => {
    const result = addressInputSchema.safeParse({
      ...validAddress,
      governorateCode: "$unknown",
    });

    expect(result.success).toBe(false);
  });

  it.each(["building", "floor", "apartment"] as const)(
    "requires the %s field",
    (field) => {
      const result = addressInputSchema.safeParse({
        ...validAddress,
        [field]: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors[field]?.[0]).toContain("required");
      }
    },
  );
});
