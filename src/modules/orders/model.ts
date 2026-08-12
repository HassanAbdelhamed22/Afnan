import "server-only";

import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { MediaAssetSchema } from "@/modules/uploads/schema";
import type { MediaAsset } from "@/modules/uploads/types";
import type { OrderStatus, WhatsAppConfirmationStatus } from "./dto";

export interface IOrderItem {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
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

export interface IOrder extends Document {
  userId: string;
  orderNumber: string;
  checkoutToken: string;
  status: OrderStatus;
  whatsappConfirmationStatus: WhatsAppConfirmationStatus;
  paymentMethod: "CASH_ON_DELIVERY";
  customerSnapshot: { name: string; email: string; phoneE164: string; whatsappE164: string };
  addressSnapshot: { recipientName: string; phoneE164: string; governorateCode: string; governorateName: string; city: string; area?: string; street: string; building: string; floor: string; apartment: string; landmark?: string; notes?: string };
  items: IOrderItem[];
  subtotalAmount: number;
  shippingFeeAmount: number;
  totalAmount: number;
  currency: "EGP";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, required: true }, variantId: { type: Schema.Types.ObjectId, required: true },
  productName: { type: String, required: true }, productSlug: { type: String, required: true }, image: MediaAssetSchema,
  sku: { type: String, required: true }, variantLabel: { type: String, required: true }, unitPriceAmount: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 }, lineTotalAmount: { type: Number, required: true, min: 0 }, personalization: String,
  fulfillmentType: { type: String, enum: ["READY_MADE", "MADE_TO_ORDER"], required: true }, preparationDaysMin: Number, preparationDaysMax: Number,
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true }, orderNumber: { type: String, required: true }, checkoutToken: { type: String, required: true },
  status: { type: String, enum: ["PENDING_CONFIRMATION", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], default: "PENDING_CONFIRMATION", required: true },
  whatsappConfirmationStatus: { type: String, enum: ["NOT_CONTACTED", "CONTACTED", "CONFIRMED", "NO_RESPONSE", "REJECTED"], default: "NOT_CONTACTED", required: true },
  paymentMethod: { type: String, enum: ["CASH_ON_DELIVERY"], default: "CASH_ON_DELIVERY", required: true },
  customerSnapshot: { name: { type: String, required: true }, email: { type: String, required: true }, phoneE164: { type: String, required: true }, whatsappE164: { type: String, required: true } },
  addressSnapshot: { recipientName: { type: String, required: true }, phoneE164: { type: String, required: true }, governorateCode: { type: String, required: true }, governorateName: { type: String, required: true }, city: { type: String, required: true }, area: String, street: { type: String, required: true }, building: { type: String, required: true }, floor: { type: String, required: true }, apartment: { type: String, required: true }, landmark: String, notes: String },
  items: { type: [OrderItemSchema], required: true }, subtotalAmount: { type: Number, required: true, min: 0 }, shippingFeeAmount: { type: Number, required: true, min: 0 }, totalAmount: { type: Number, required: true, min: 0 }, currency: { type: String, enum: ["EGP"], default: "EGP", required: true },
}, { timestamps: true });

OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ checkoutToken: 1 }, { unique: true });
OrderSchema.index({ userId: 1, createdAt: -1 });

export const OrderModel = (models.Order as Model<IOrder> | undefined) ?? model<IOrder>("Order", OrderSchema);
