import "server-only";
import { Types } from "mongoose";
import { InvalidStateError, NotFoundError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import { ProductModel } from "@/modules/products/model";
import { canTransitionOrder } from "./domain";
import { OrderModel, type IOrderItem } from "./model";
import type { OrderStatus, WhatsAppConfirmationStatus } from "./dto";

async function restoreStock(order: InstanceType<typeof OrderModel>, session: import("mongoose").ClientSession) {
  if (order.stockRestored) return;
  const totals = new Map<string, { productId: Types.ObjectId; variantId: Types.ObjectId; quantity: number; slug: string }>();
  order.items.filter((item: IOrderItem) => item.fulfillmentType === "READY_MADE").forEach((item: IOrderItem) => { const key = `${item.productId}:${item.variantId}`; const current = totals.get(key); totals.set(key, { productId: item.productId, variantId: item.variantId, quantity: (current?.quantity ?? 0) + item.quantity, slug: item.productSlug }); });
  for (const stock of totals.values()) await ProductModel.updateOne({ _id: stock.productId, "variants._id": stock.variantId }, { $inc: { "variants.$[variant].stockQuantity": stock.quantity } }, { arrayFilters: [{ "variant._id": stock.variantId }], session });
  order.stockRestored = true; order.stockRestoredAt = new Date();
}
async function applyTransition(order: InstanceType<typeof OrderModel>, status: OrderStatus, actorId: string, note: string | undefined, session: import("mongoose").ClientSession) {
  if (!canTransitionOrder(order.status, status)) throw new InvalidStateError(`Order cannot move from ${order.status} to ${status}`);
  if (status === "CANCELLED") await restoreStock(order, session);
  order.status = status; order.statusHistory.push({ status, timestamp: new Date(), actorId, note }); if (note) order.adminNote = note;
}
function targets(order: InstanceType<typeof OrderModel>) { return [...new Map(order.items.filter((item: IOrderItem) => item.fulfillmentType === "READY_MADE").map((item: IOrderItem) => [item.productId.toString(), { id: item.productId.toString(), slug: item.productSlug }])).values()]; }
export async function transitionAdminOrder(orderNumber: string, status: OrderStatus, actorId: string, note?: string) {
  const mongoose = await connectMongoose(); const session = await mongoose.startSession(); let productTargets: Array<{ id: string; slug: string }> = [];
  try { await session.withTransaction(async () => { const order = await OrderModel.findOne({ orderNumber }).session(session); if (!order) throw new NotFoundError("Order not found"); await applyTransition(order, status, actorId, note, session); await order.save({ session }); productTargets = status === "CANCELLED" ? targets(order) : []; }); return { productTargets }; } finally { await session.endSession(); }
}
export async function recordAdminWhatsAppResult(orderNumber: string, result: Exclude<WhatsAppConfirmationStatus, "NOT_CONTACTED">, actorId: string, note?: string) {
  const mongoose = await connectMongoose(); const session = await mongoose.startSession(); let productTargets: Array<{ id: string; slug: string }> = [];
  try { await session.withTransaction(async () => { const order = await OrderModel.findOne({ orderNumber }).session(session); if (!order) throw new NotFoundError("Order not found"); order.whatsappConfirmationStatus = result; order.whatsappNote = note; order.whatsappContactedAt ??= new Date(); if (result === "CONFIRMED") { await applyTransition(order, "CONFIRMED", actorId, note, session); order.whatsappConfirmedAt = new Date(); } if (result === "REJECTED") { await applyTransition(order, "CANCELLED", actorId, note || "Customer rejected the order", session); productTargets = targets(order); } await order.save({ session }); }); return { productTargets }; } finally { await session.endSession(); }
}
