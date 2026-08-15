import "server-only";

import { Schema, model, models, type Document, type Model } from "mongoose";
import { MediaAssetSchema } from "./schema";
import type { MediaAsset } from "./types";
import type { UploadPurpose } from "./paths";

export interface IUploadIntent extends Document {
  userId: string;
  purpose: UploadPurpose;
  publicId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  status: "PENDING" | "COMPLETED" | "CLAIMED" | "DISCARDING";
  asset?: MediaAsset;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UploadIntentSchema = new Schema<IUploadIntent>({
  userId: { type: String, required: true },
  purpose: { type: String, enum: ["CATEGORY_IMAGE", "CUSTOM_REQUEST_REFERENCE", "PRODUCT_IMAGE"], required: true },
  publicId: { type: String, required: true }, originalFilename: { type: String, required: true },
  mimeType: { type: String, required: true }, sizeBytes: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "COMPLETED", "CLAIMED", "DISCARDING"], required: true, default: "PENDING" },
  asset: MediaAssetSchema, expiresAt: { type: Date, required: true },
}, { timestamps: true });

UploadIntentSchema.index({ publicId: 1 }, { unique: true });
UploadIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UploadIntentSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const UploadIntentModel = (models.UploadIntent as Model<IUploadIntent> | undefined) ?? model<IUploadIntent>("UploadIntent", UploadIntentSchema);
