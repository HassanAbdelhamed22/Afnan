import { formatEGP } from "@/lib/money";
import { normalizeEgyptianPhone } from "@/lib/phone";
import type { OrderStatus } from "./dto";

export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"], SHIPPED: ["DELIVERED"], DELIVERED: [], CANCELLED: [],
};
export function canTransitionOrder(from: OrderStatus, to: OrderStatus) { return ORDER_TRANSITIONS[from].includes(to); }

export function buildWhatsAppLink(input: { phoneE164: string; orderNumber: string; customerName: string; totalAmount: number; deliveryArea: string; template: string }) {
  const phone = normalizeEgyptianPhone(input.phoneE164).slice(1);
  const message = input.template
    .replaceAll("{customerName}", input.customerName).replaceAll("{orderNumber}", input.orderNumber)
    .replaceAll("{total}", formatEGP(input.totalAmount)).replaceAll("{deliveryArea}", input.deliveryArea);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
