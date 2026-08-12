import "server-only";

import { Schema, model, models, type Document, type Model } from "mongoose";
import { MediaAssetSchema } from "@/modules/uploads/schema";
import type { MediaAsset } from "@/modules/uploads/types";
import type { CustomRequestStatus } from "./dto";

export interface ICustomRequest extends Document {
  userId: string; requestNumber: string; title: string; description: string; material?: string;
  colors: string[]; dimensions?: string; quantity: number; desiredDate?: Date;
  budgetMinAmount?: number; budgetMaxAmount?: number; currency: "EGP";
  referenceImages: MediaAsset[]; status: CustomRequestStatus;
  customerSnapshot: { name: string; email: string; phoneE164: string; whatsappE164: string };
  internalNotes?: string; createdAt: Date; updatedAt: Date;
}

const CustomRequestSchema = new Schema<ICustomRequest>({
  userId: { type: String, required: true }, requestNumber: { type: String, required: true },
  title: { type: String, required: true, trim: true }, description: { type: String, required: true, trim: true },
  material: String, colors: { type: [String], default: [] }, dimensions: String,
  quantity: { type: Number, required: true, min: 1 }, desiredDate: Date,
  budgetMinAmount: Number, budgetMaxAmount: Number, currency: { type: String, enum: ["EGP"], default: "EGP", required: true },
  referenceImages: { type: [MediaAssetSchema], default: [] },
  status: { type: String, enum: ["SUBMITTED", "CONTACTED", "ACCEPTED", "REJECTED", "COMPLETED"], required: true, default: "SUBMITTED" },
  customerSnapshot: { name: { type: String, required: true }, email: { type: String, required: true }, phoneE164: { type: String, required: true }, whatsappE164: { type: String, required: true } },
  internalNotes: String,
}, { timestamps: true });

CustomRequestSchema.index({ requestNumber: 1 }, { unique: true });
CustomRequestSchema.index({ userId: 1, createdAt: -1 });

export const CustomRequestModel = (models.CustomRequest as Model<ICustomRequest> | undefined) ?? model<ICustomRequest>("CustomRequest", CustomRequestSchema);
