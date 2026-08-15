import "server-only";

import { connectMongoose } from "@/lib/mongoose";
import { CustomRequestModel } from "@/modules/custom-requests/model";
import { OrderModel } from "@/modules/orders/model";

export interface AdminDashboardDTO {
  counts: { pendingOrders: number; activeOrders: number; deliveredOrders: number; openCustomRequests: number };
  recentOrders: Array<{ orderNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }>;
  recentCustomRequests: Array<{ requestNumber: string; title: string; customerName: string; status: string; createdAt: string }>;
}

export async function getAdminDashboard(): Promise<AdminDashboardDTO> {
  await connectMongoose();
  const [pendingOrders, activeOrders, deliveredOrders, openCustomRequests, orderRecords, requestRecords] = await Promise.all([
    OrderModel.countDocuments({ status: "PENDING_CONFIRMATION" }),
    OrderModel.countDocuments({ status: { $in: ["CONFIRMED", "PROCESSING", "SHIPPED"] } }),
    OrderModel.countDocuments({ status: "DELIVERED" }),
    CustomRequestModel.countDocuments({ status: { $in: ["SUBMITTED", "CONTACTED", "ACCEPTED"] } }),
    OrderModel.find({}).select("orderNumber customerSnapshot status totalAmount createdAt").sort({ createdAt: -1 }).limit(5).lean(),
    CustomRequestModel.find({}).select("requestNumber title customerSnapshot status createdAt").sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return {
    counts: { pendingOrders, activeOrders, deliveredOrders, openCustomRequests },
    recentOrders: orderRecords.map((order) => ({ orderNumber: order.orderNumber, customerName: order.customerSnapshot.name, status: order.status, totalAmount: order.totalAmount, createdAt: order.createdAt.toISOString() })),
    recentCustomRequests: requestRecords.map((request) => ({ requestNumber: request.requestNumber, title: request.title, customerName: request.customerSnapshot.name, status: request.status, createdAt: request.createdAt.toISOString() })),
  };
}
