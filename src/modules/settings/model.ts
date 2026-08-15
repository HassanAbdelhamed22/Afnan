import "server-only";

import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IStoreSettings extends Document {
  singletonKey: "STORE_SETTINGS"; storeName: string; adminEmail: string; adminWhatsappE164: string;
  orderPrefix: string; customRequestPrefix: string; whatsappOrderTemplate: string;
  socialLinks: { instagram?: string; facebook?: string; tiktok?: string };
  createdAt: Date; updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>({
  singletonKey: { type: String, enum: ["STORE_SETTINGS"], required: true, default: "STORE_SETTINGS", immutable: true },
  storeName: { type: String, required: true, trim: true }, adminEmail: { type: String, required: true, trim: true, lowercase: true },
  adminWhatsappE164: { type: String, required: true }, orderPrefix: { type: String, required: true }, customRequestPrefix: { type: String, required: true },
  whatsappOrderTemplate: { type: String, required: true }, socialLinks: { instagram: String, facebook: String, tiktok: String },
}, { timestamps: true });
StoreSettingsSchema.index({ singletonKey: 1 }, { unique: true });
export const StoreSettingsModel = (models.StoreSettings as Model<IStoreSettings> | undefined) ?? model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
