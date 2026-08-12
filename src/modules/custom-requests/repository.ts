import "server-only";

import { connectMongoose } from "@/lib/mongoose";
import { NotFoundError } from "@/lib/errors/app-error";
import type { CustomRequestDTO } from "./dto";
import { CustomRequestModel, type ICustomRequest } from "./model";

type RequestRecord = Pick<ICustomRequest, "_id" | "requestNumber" | "title" | "description" | "material" | "colors" | "dimensions" | "quantity" | "desiredDate" | "budgetMinAmount" | "budgetMaxAmount" | "referenceImages" | "status" | "createdAt">;

function mapRequest(record: RequestRecord): CustomRequestDTO {
  return {
    id: record._id.toString(), requestNumber: record.requestNumber, title: record.title,
    description: record.description, material: record.material || undefined,
    colors: record.colors, dimensions: record.dimensions || undefined, quantity: record.quantity,
    desiredDate: record.desiredDate?.toISOString(), budgetMinAmount: record.budgetMinAmount,
    budgetMaxAmount: record.budgetMaxAmount, referenceImages: record.referenceImages,
    status: record.status, createdAt: record.createdAt.toISOString(),
  };
}

export async function listCustomerCustomRequests(userId: string) {
  await connectMongoose();
  const records = await CustomRequestModel.find({ userId })
    .select("requestNumber title description material colors dimensions quantity desiredDate budgetMinAmount budgetMaxAmount referenceImages status createdAt")
    .sort({ createdAt: -1 }).limit(50).lean<RequestRecord[]>();
  return records.map(mapRequest);
}

export async function getCustomerCustomRequestByNumber(userId: string, requestNumber: string) {
  await connectMongoose();
  const record = await CustomRequestModel.findOne({ userId, requestNumber })
    .select("requestNumber title description material colors dimensions quantity desiredDate budgetMinAmount budgetMaxAmount referenceImages status createdAt")
    .lean<RequestRecord>();
  if (!record) throw new NotFoundError("Custom request not found");
  return mapRequest(record);
}
