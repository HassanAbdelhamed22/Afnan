import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/config/cache";
import { connectMongoose } from "@/lib/mongoose";
import type { StoreSettingsInput } from "./schemas";
import { StoreSettingsModel } from "./model";

export interface StoreSettingsDTO {
  storeName: string; adminEmail: string; adminWhatsappE164: string; orderPrefix: string; customRequestPrefix: string;
  whatsappOrderTemplate: string; socialLinks: { instagram?: string; facebook?: string; tiktok?: string };
}
export const DEFAULT_STORE_SETTINGS: StoreSettingsDTO = {
  storeName: "Afnan", adminEmail: "admin@afnan.eg", adminWhatsappE164: "+201000000000", orderPrefix: "AFN", customRequestPrefix: "CR",
  whatsappOrderTemplate: "Hello {customerName}, we are confirming order {orderNumber} totaling {total} for delivery to {deliveryArea}. Would you like us to proceed?",
  socialLinks: {},
};
function map(record: { storeName: string; adminEmail: string; adminWhatsappE164: string; orderPrefix: string; customRequestPrefix: string; whatsappOrderTemplate: string; socialLinks?: StoreSettingsDTO["socialLinks"] }): StoreSettingsDTO { return { storeName: record.storeName, adminEmail: record.adminEmail, adminWhatsappE164: record.adminWhatsappE164, orderPrefix: record.orderPrefix, customRequestPrefix: record.customRequestPrefix, whatsappOrderTemplate: record.whatsappOrderTemplate, socialLinks: record.socialLinks ?? {} }; }
async function readSettingsRecord() { await connectMongoose(); const record = await StoreSettingsModel.findOne({ singletonKey: "STORE_SETTINGS" }).select("storeName adminEmail adminWhatsappE164 orderPrefix customRequestPrefix whatsappOrderTemplate socialLinks").lean(); return record ? map(record) : null; }
async function readSettings() { return (await readSettingsRecord()) ?? DEFAULT_STORE_SETTINGS; }
export async function getAdminStoreSettings(defaultAdminEmail?: string) {
  const settings = await readSettingsRecord();
  if (settings) return settings;
  return defaultAdminEmail
    ? { ...DEFAULT_STORE_SETTINGS, adminEmail: defaultAdminEmail.trim().toLowerCase() }
    : DEFAULT_STORE_SETTINGS;
}
export const getStoreSettings = unstable_cache(readSettings, ["store-settings"], { tags: [CACHE_TAGS.storeSettings], revalidate: 900 });
export async function saveStoreSettings(input: StoreSettingsInput) { await connectMongoose(); await StoreSettingsModel.updateOne({ singletonKey: "STORE_SETTINGS" }, { $set: { storeName: input.storeName, adminEmail: input.adminEmail, adminWhatsappE164: input.adminWhatsapp, orderPrefix: input.orderPrefix, customRequestPrefix: input.customRequestPrefix, whatsappOrderTemplate: input.whatsappOrderTemplate, socialLinks: { instagram: input.instagram, facebook: input.facebook, tiktok: input.tiktok } }, $setOnInsert: { singletonKey: "STORE_SETTINGS" } }, { upsert: true, runValidators: true }); return readSettings(); }
