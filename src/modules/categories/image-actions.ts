"use server";

import { revalidatePath } from "next/cache";

import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { requireAdmin } from "@/modules/auth/dal";
import { revalidateCategoryCache } from "@/modules/catalog/queries";
import { discardUploadIntent } from "@/modules/uploads/service";

import { attachCategoryImageSchema, removeCategoryImageSchema } from "./image-schemas";
import { attachCategoryImage, removeCategoryImage } from "./image-service";

type Data = { categoryId: string } | null;
function text(form: FormData, key: string) { const value = form.get(key); return typeof value === "string" ? value.trim() : ""; }
function crop(form: FormData) { try { return JSON.parse(text(form, "crop")) as unknown; } catch { return undefined; } }
function refresh(category: { id: string; slug: string }) {
  revalidateCategoryCache(category.id, category.slug);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${category.id}`);
}
async function cleanup(adminId: string, intentId: string) { await discardUploadIntent(adminId, intentId, "CATEGORY_IMAGE").catch((error) => logger.error("category_image_orphan_cleanup_failed", { errorName: error instanceof Error ? error.name : "UnknownError" })); }

export async function attachCategoryImageAction(form: FormData): Promise<ActionResult<Data>> {
  const session = await requireAdmin();
  const intentId = text(form, "intentId");
  const parsed = attachCategoryImageSchema.safeParse({ categoryId: text(form, "categoryId"), intentId, alt: text(form, "alt"), fitMode: text(form, "fitMode") || undefined, crop: crop(form) });
  if (!parsed.success) { await cleanup(session.user.id, intentId); return actionFailure("VALIDATION_ERROR", "Choose an image and provide meaningful alt text"); }
  try {
    const category = await attachCategoryImage(session.user.id, parsed.data.categoryId, parsed.data.intentId, parsed.data.alt, parsed.data.fitMode, parsed.data.crop);
    refresh(category);
    return actionSuccess({ categoryId: category.id }, "Category image attached");
  } catch (error) {
    await cleanup(session.user.id, parsed.data.intentId);
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "Category image could not be updated");
  }
}

export async function removeCategoryImageAction(form: FormData): Promise<ActionResult<Data>> {
  await requireAdmin();
  const parsed = removeCategoryImageSchema.safeParse({ categoryId: text(form, "categoryId") });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid category image");
  try {
    const category = await removeCategoryImage(parsed.data.categoryId);
    refresh(category);
    return actionSuccess({ categoryId: category.id }, "Category image removed");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "Category image could not be removed");
  }
}
