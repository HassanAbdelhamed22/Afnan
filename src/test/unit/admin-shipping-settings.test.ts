import { describe, expect, it } from "vitest";
import { shippingRateInputSchema } from "@/modules/shipping/admin-schemas";
import { StoreSettingsModel } from "@/modules/settings/model";
import { storeSettingsInputSchema } from "@/modules/settings/schemas";

const settings = { storeName: "Afnan", adminEmail: "admin@afnan.eg", adminWhatsapp: "01012345678", orderPrefix: "AFN", customRequestPrefix: "CR", whatsappOrderTemplate: "Hello {customerName}, confirm {orderNumber} totaling {total} for {deliveryArea}.", instagram: "", facebook: "", tiktok: "" };
describe("shipping and store settings rules", () => {
  it("accepts configured Egyptian governorates and sensible delivery ranges", () => {
    expect(shippingRateInputSchema.safeParse({ governorateCode: "cairo", feeAmount: 5000, minDeliveryDays: 2, maxDeliveryDays: 4, isActive: true }).success).toBe(true);
    expect(shippingRateInputSchema.safeParse({ governorateCode: "$ne", feeAmount: -1, minDeliveryDays: 8, maxDeliveryDays: 2, isActive: true }).success).toBe(false);
  });
  it("normalizes the admin phone and rejects unsupported message placeholders", () => {
    const valid = storeSettingsInputSchema.parse(settings);
    expect(valid.adminWhatsapp).toBe("+201012345678");
    expect(storeSettingsInputSchema.safeParse({ ...settings, whatsappOrderTemplate: `${settings.whatsappOrderTemplate} {coupon}` }).success).toBe(false);
  });
  it("enforces a singleton store-settings index", () => {
    expect(StoreSettingsModel.schema.indexes()).toContainEqual([{ singletonKey: 1 }, expect.objectContaining({ unique: true })]);
  });
});
