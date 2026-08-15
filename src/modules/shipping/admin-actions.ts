"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/config/cache";
import { AppError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireAdmin } from "@/modules/auth/dal";
import { saveAdminShippingRate } from "./admin-repository";
import { shippingRateInputSchema } from "./admin-schemas";

function text(form: FormData, key: string) { const value = form.get(key); return typeof value === "string" ? value.trim() : ""; }
function money(value: string) { if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return Number.NaN; const [whole, fraction = ""] = value.split("."); return Number(whole) * 100 + Number(fraction.padEnd(2, "0")); }

export async function saveShippingRateAction(_state: ActionResult<{ governorateCode: string } | null>, form: FormData): Promise<ActionResult<{ governorateCode: string } | null>> {
  await requireAdmin();
  const parsed = shippingRateInputSchema.safeParse({ governorateCode: text(form, "governorateCode"), feeAmount: money(text(form, "fee")), minDeliveryDays: Number(text(form, "minDeliveryDays")), maxDeliveryDays: Number(text(form, "maxDeliveryDays")), isActive: form.get("isActive") === "on" });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Please correct the shipping rate", getZodFieldErrors(parsed.error));
  try { const code = await saveAdminShippingRate(parsed.data); updateTag(CACHE_TAGS.shippingRates); revalidatePath("/admin/shipping"); return actionSuccess({ governorateCode: code }, "Shipping rate updated"); }
  catch (error) { if (error instanceof AppError) return actionFailure(error.code, error.message); return actionFailure("INTERNAL_ERROR", "Shipping rate could not be updated"); }
}
