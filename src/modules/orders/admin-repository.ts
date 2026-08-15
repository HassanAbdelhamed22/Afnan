import "server-only";
import { type PipelineStage } from "mongoose";
import { NotFoundError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import type { AdminOrderDetailDTO, AdminOrderListItemDTO, PaginatedAdminOrdersDTO } from "./admin-dto";
import type { AdminOrderFilters } from "./admin-schemas";
import { OrderModel, type IOrder } from "./model";
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
export async function listAdminOrders(filters: AdminOrderFilters): Promise<PaginatedAdminOrdersDTO> {
  await connectMongoose(); const match: Record<string, unknown> = {};
  if (filters.status !== "ALL") match.status = filters.status; if (filters.whatsapp !== "ALL") match.whatsappConfirmationStatus = filters.whatsapp;
  if (filters.search) { const safe = new RegExp(escapeRegex(filters.search), "i"); match.$or = [{ orderNumber: safe }, { "customerSnapshot.name": safe }, { "customerSnapshot.phoneE164": safe }, { "customerSnapshot.whatsappE164": safe }]; }
  const sort: Record<string, 1 | -1> = filters.sort === "oldest" ? { createdAt: 1, _id: 1 } : filters.sort === "newest" ? { createdAt: -1, _id: -1 } : { pendingPriority: 1, createdAt: -1, _id: -1 };
  const pipeline: PipelineStage[] = [{ $match: match }, { $addFields: { pendingPriority: { $cond: [{ $eq: ["$status", "PENDING_CONFIRMATION"] }, 0, 1] } } }, { $sort: sort }, { $skip: (filters.page - 1) * filters.limit }, { $limit: filters.limit }, { $project: { orderNumber: 1, status: 1, whatsappConfirmationStatus: 1, customerSnapshot: 1, addressSnapshot: 1, totalAmount: 1, currency: 1, createdAt: 1 } }];
  const [records, total] = await Promise.all([OrderModel.aggregate(pipeline), OrderModel.countDocuments(match)]);
  return { orders: records.map((record): AdminOrderListItemDTO => ({ orderNumber: record.orderNumber, status: record.status, whatsappConfirmationStatus: record.whatsappConfirmationStatus, customerName: record.customerSnapshot.name, phoneE164: record.customerSnapshot.whatsappE164, governorateName: record.addressSnapshot.governorateName, totalAmount: record.totalAmount, currency: record.currency, createdAt: record.createdAt.toISOString() })), total, page: filters.page, totalPages: Math.max(1, Math.ceil(total / filters.limit)) };
}
export async function getAdminOrderByNumber(orderNumber: string): Promise<AdminOrderDetailDTO> {
  await connectMongoose(); const order = await OrderModel.findOne({ orderNumber }).select("orderNumber status whatsappConfirmationStatus paymentMethod customerSnapshot addressSnapshot items subtotalAmount shippingFeeAmount totalAmount currency customerNote adminNote whatsappNote whatsappContactedAt whatsappConfirmedAt statusHistory stockRestored createdAt").lean<IOrder>();
  if (!order) throw new NotFoundError("Order not found");
  return { id: order._id.toString(), orderNumber: order.orderNumber, status: order.status, whatsappConfirmationStatus: order.whatsappConfirmationStatus, customerName: order.customerSnapshot.name, phoneE164: order.customerSnapshot.whatsappE164, governorateName: order.addressSnapshot.governorateName, totalAmount: order.totalAmount, currency: order.currency, createdAt: order.createdAt.toISOString(), paymentMethod: order.paymentMethod, customerSnapshot: order.customerSnapshot, addressSnapshot: order.addressSnapshot, items: order.items.map((item) => ({ ...item, productId: undefined, variantId: undefined })), subtotalAmount: order.subtotalAmount, shippingFeeAmount: order.shippingFeeAmount, customerNote: order.customerNote, adminNote: order.adminNote, whatsappNote: order.whatsappNote, whatsappContactedAt: order.whatsappContactedAt?.toISOString(), whatsappConfirmedAt: order.whatsappConfirmedAt?.toISOString(), statusHistory: (order.statusHistory ?? []).map((entry) => ({ status: entry.status, timestamp: entry.timestamp.toISOString(), actorId: entry.actorId, note: entry.note })), stockRestored: order.stockRestored };
}
