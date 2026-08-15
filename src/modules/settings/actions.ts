"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/config/cache";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireAdmin } from "@/modules/auth/dal";
import type { StoreSettingsDTO } from "./repository";
import { saveStoreSettings } from "./repository";
import { storeSettingsInputSchema } from "./schemas";
function text(form: FormData, key: string) { const value = form.get(key); return typeof value === "string" ? value.trim() : ""; }
export async function saveStoreSettingsAction(_state: ActionResult<StoreSettingsDTO | null>, form: FormData): Promise<ActionResult<StoreSettingsDTO | null>> {
  await requireAdmin();
  const parsed = storeSettingsInputSchema.safeParse({ storeName: text(form, "storeName"), adminEmail: text(form, "adminEmail"), adminWhatsapp: text(form, "adminWhatsapp"), orderPrefix: text(form, "orderPrefix"), customRequestPrefix: text(form, "customRequestPrefix"), whatsappOrderTemplate: text(form, "whatsappOrderTemplate"), instagram: text(form, "instagram"), facebook: text(form, "facebook"), tiktok: text(form, "tiktok") });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Please correct the store settings", getZodFieldErrors(parsed.error));
  try { const settings = await saveStoreSettings(parsed.data); updateTag(CACHE_TAGS.storeSettings); revalidatePath("/admin/settings"); return actionSuccess(settings, "Store settings updated"); }
  catch { return actionFailure("INTERNAL_ERROR", "Store settings could not be updated"); }
}
