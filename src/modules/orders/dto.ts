import type { MediaAsset } from "@/modules/uploads/types";

export type OrderStatus = "PENDING_CONFIRMATION" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type WhatsAppConfirmationStatus = "NOT_CONTACTED" | "CONTACTED" | "CONFIRMED" | "NO_RESPONSE" | "REJECTED";

export interface OrderItemDTO {
  productName: string;
  productSlug: string;
  image?: MediaAsset;
  sku: string;
  variantLabel: string;
  unitPriceAmount: number;
  quantity: number;
  lineTotalAmount: number;
  personalization?: string;
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  preparationDaysMin?: number;
  preparationDaysMax?: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "CASH_ON_DELIVERY";
  items: OrderItemDTO[];
  subtotalAmount: number;
  shippingFeeAmount: number;
  totalAmount: number;
  currency: "EGP";
  governorateName: string;
  recipientName: string;
  createdAt: string;
}
