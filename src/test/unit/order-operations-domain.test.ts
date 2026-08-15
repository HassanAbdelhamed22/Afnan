import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, canTransitionOrder } from "@/modules/orders/domain";
describe("order operations domain", () => {
  it("allows only the simplified order flow", () => { expect(canTransitionOrder("PENDING_CONFIRMATION", "CONFIRMED")).toBe(true); expect(canTransitionOrder("PENDING_CONFIRMATION", "SHIPPED")).toBe(false); expect(canTransitionOrder("SHIPPED", "DELIVERED")).toBe(true); expect(canTransitionOrder("DELIVERED", "CANCELLED")).toBe(false); });
  it("builds an encoded WhatsApp link from normalized Egyptian phone and settings template", () => { const link = buildWhatsAppLink({ phoneE164: "01012345678", orderNumber: "AFN-1", customerName: "Afnan Customer", totalAmount: 12550, deliveryArea: "Nasr City, Cairo", template: "Hello {customerName}; confirm {orderNumber}, {total}, {deliveryArea}?" }); expect(link.startsWith("https://wa.me/201012345678?text=")).toBe(true); expect(decodeURIComponent(link)).toContain("Afnan Customer"); expect(decodeURIComponent(link)).toContain("AFN-1"); });
});
