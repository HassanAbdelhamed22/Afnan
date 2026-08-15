import "server-only";

import { randomBytes } from "crypto";
import { Types } from "mongoose";
import { AppError, ConflictError, InvalidStateError } from "@/lib/errors/app-error";
import { connectMongoose } from "@/lib/mongoose";
import { sendNewCustomRequestAdminEmail } from "@/modules/email";
import { UploadIntentModel } from "@/modules/uploads/model";
import { CustomRequestModel } from "./model";
import type { CustomRequestInput } from "./schemas";
import { logger } from "@/lib/logger";

interface RequestCustomer { id: string; name: string; email: string; phoneE164?: string | null; whatsappE164?: string | null }
function requestNumber() { return `CR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`; }

export async function createCustomRequest(customer: RequestCustomer, input: CustomRequestInput) {
  if (!customer.phoneE164) throw new InvalidStateError("Add a phone number to your profile before submitting a request");
  const mongoose = await connectMongoose();
  const recentRequestCount = await CustomRequestModel.countDocuments({ userId: customer.id, createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } });
  if (recentRequestCount >= 5) throw new AppError({ code: "RATE_LIMITED", message: "Too many custom requests. Try again later", statusCode: 429 });
  const session = await mongoose.startSession();
  const number = requestNumber();
  try {
    await session.withTransaction(async () => {
      const uniqueIntentIds = [...new Set(input.uploadIntentIds)];
      if (uniqueIntentIds.length !== input.uploadIntentIds.length) throw new InvalidStateError("Reference images contain duplicates");
      const intents = uniqueIntentIds.length ? await UploadIntentModel.find({ _id: { $in: uniqueIntentIds.map((id) => new Types.ObjectId(id)) }, userId: customer.id, purpose: "CUSTOM_REQUEST_REFERENCE", status: "COMPLETED", expiresAt: { $gt: new Date() } }).session(session).lean() : [];
      if (intents.length !== uniqueIntentIds.length || intents.some((intent) => !intent.asset)) throw new InvalidStateError("One or more reference images are unavailable");
      const claimed = uniqueIntentIds.length ? await UploadIntentModel.updateMany({ _id: { $in: intents.map((intent) => intent._id) }, userId: customer.id, status: "COMPLETED" }, { $set: { status: "CLAIMED" } }, { session }) : { modifiedCount: 0 };
      if (claimed.modifiedCount !== uniqueIntentIds.length) throw new ConflictError("Reference images were already used");
      const request = new CustomRequestModel({
        userId: customer.id, requestNumber: number, title: input.title, description: input.description,
        material: input.material, colors: input.colors, dimensions: input.dimensions, quantity: input.quantity,
        desiredDate: input.desiredDate ? new Date(`${input.desiredDate}T00:00:00.000Z`) : undefined,
        budgetMinAmount: input.budgetMinAmount, budgetMaxAmount: input.budgetMaxAmount,
        referenceImages: intents.map((intent) => intent.asset), status: "SUBMITTED", currency: "EGP",
        customerSnapshot: { name: customer.name, email: customer.email, phoneE164: customer.phoneE164, whatsappE164: customer.whatsappE164 || customer.phoneE164 },
      });
      await request.save({ session });
    });
  } finally {
    await session.endSession();
  }
  await sendNewCustomRequestAdminEmail({ requestNumber: number, customerName: customer.name, customerPhone: customer.phoneE164, summary: input.title }).catch(() => logger.error("New custom request admin email failed", { requestNumber: number }));
  return number;
}
