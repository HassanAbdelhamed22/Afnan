import "server-only";

import { connectMongoose } from "@/lib/mongoose";
import { NotFoundError } from "@/lib/errors/app-error";
import type { OrderDTO } from "./dto";
import { OrderModel, type IOrder } from "./model";

type OrderRecord = Pick<IOrder, "_id" | "orderNumber" | "status" | "paymentMethod" | "items" | "subtotalAmount" | "shippingFeeAmount" | "totalAmount" | "currency" | "addressSnapshot" | "createdAt">;

function mapOrder(record: OrderRecord): OrderDTO {
  return {
    id: record._id.toString(), orderNumber: record.orderNumber, status: record.status,
    paymentMethod: record.paymentMethod,
    items: record.items.map((item) => ({
      productName: item.productName, productSlug: item.productSlug, image: item.image,
      sku: item.sku, variantLabel: item.variantLabel, unitPriceAmount: item.unitPriceAmount,
      quantity: item.quantity, lineTotalAmount: item.lineTotalAmount,
      personalization: item.personalization || undefined, fulfillmentType: item.fulfillmentType,
      preparationDaysMin: item.preparationDaysMin, preparationDaysMax: item.preparationDaysMax,
    })),
    subtotalAmount: record.subtotalAmount, shippingFeeAmount: record.shippingFeeAmount,
    totalAmount: record.totalAmount, currency: record.currency,
    governorateName: record.addressSnapshot.governorateName,
    recipientName: record.addressSnapshot.recipientName, createdAt: record.createdAt.toISOString(),
  };
}

const projection = "orderNumber status paymentMethod items subtotalAmount shippingFeeAmount totalAmount currency addressSnapshot createdAt";

export async function listCustomerOrders(userId: string): Promise<OrderDTO[]> {
  await connectMongoose();
  const records = await OrderModel.find({ userId }).select(projection).sort({ createdAt: -1 }).limit(50).lean<OrderRecord[]>();
  return records.map(mapOrder);
}

export async function getCustomerOrderByNumber(userId: string, orderNumber: string): Promise<OrderDTO> {
  await connectMongoose();
  const record = await OrderModel.findOne({ userId, orderNumber }).select(projection).lean<OrderRecord>();
  if (!record) throw new NotFoundError("Order not found");
  return mapOrder(record);
}
