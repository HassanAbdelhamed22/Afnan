import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), saveRate: vi.fn(), saveSettings: vi.fn(), updateTag: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("@/modules/auth/dal", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/modules/shipping/admin-repository", () => ({ saveAdminShippingRate: mocks.saveRate }));
vi.mock("@/modules/settings/repository", () => ({ saveStoreSettings: mocks.saveSettings }));
import { saveShippingRateAction } from "@/modules/shipping/admin-actions";
import { saveStoreSettingsAction } from "@/modules/settings/actions";

describe("shipping and settings actions", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.requireAdmin.mockResolvedValue({ user: { id: "admin-1" } }); });
  it("authorizes and converts shipping EGP to integer minor units", async () => {
    mocks.saveRate.mockResolvedValue("cairo"); const form = new FormData(); form.set("governorateCode", "cairo"); form.set("fee", "75.50"); form.set("minDeliveryDays", "2"); form.set("maxDeliveryDays", "4"); form.set("isActive", "on");
    const result = await saveShippingRateAction({ ok: true, data: null }, form);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce(); expect(mocks.saveRate).toHaveBeenCalledWith({ governorateCode: "cairo", feeAmount: 7550, minDeliveryDays: 2, maxDeliveryDays: 4, isActive: true }); expect(mocks.updateTag).toHaveBeenCalledWith("shipping-rates"); expect(result.ok).toBe(true);
  });
  it("never accepts provider secrets as database settings", async () => {
    const form = new FormData(); form.set("storeName", "Afnan"); form.set("adminEmail", "admin@afnan.eg"); form.set("adminWhatsapp", "01012345678"); form.set("orderPrefix", "AFN"); form.set("customRequestPrefix", "CR"); form.set("whatsappOrderTemplate", "Hello {customerName}, confirm {orderNumber} totaling {total} for {deliveryArea}."); form.set("CLOUDINARY_API_SECRET", "must-not-persist");
    mocks.saveSettings.mockResolvedValue({ storeName: "Afnan" }); const result = await saveStoreSettingsAction({ ok: true, data: null }, form);
    expect(mocks.saveSettings).toHaveBeenCalledWith(expect.not.objectContaining({ CLOUDINARY_API_SECRET: expect.anything() })); expect(mocks.updateTag).toHaveBeenCalledWith("store-settings"); expect(result.ok).toBe(true);
  });
});
