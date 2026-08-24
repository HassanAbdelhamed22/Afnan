"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { requireAdmin } from "@/modules/auth/dal";
import { revalidateCategoryCache, revalidateProductCache } from "@/modules/catalog/queries";
import { discardUploadIntent } from "@/modules/uploads/service";
import { approveProductImageSchema, attachProductImageSchema, orderProductImageSchema, productImageTargetSchema } from "./image-schemas";
import { approveProductImage, attachProductImage, orderProductImage, removeProductImage, requestProductImageEnhancement } from "./image-service";

type Data = { productId: string } | null;
function text(form: FormData, key: string) { const value = form.get(key); return typeof value === "string" ? value.trim() : ""; }
function crop(form: FormData) { try { return JSON.parse(text(form, "crop")) as unknown; } catch { return undefined; } }
function validationIssueSummary(error: unknown) {
  if (!error || typeof error !== "object" || !("errors" in error)) return undefined;
  const errors = (error as { errors?: unknown }).errors;
  if (!errors || typeof errors !== "object") return undefined;
  const issues = Object.values(errors).slice(0, 20).flatMap((issue) => {
    if (!issue || typeof issue !== "object") return [];
    const path = "path" in issue && typeof issue.path === "string" ? issue.path.replace(/[^a-zA-Z0-9_.[\]-]/g, "").slice(0, 160) : "unknown";
    const kind = "kind" in issue && typeof issue.kind === "string" ? issue.kind.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 80) : "validation";
    return [`${path}:${kind}`];
  });
  return issues.length ? issues.join(",") : undefined;
}
function refresh(product: { id: string; slug: string; categoryId: string }) {
  revalidateProductCache(product.id, product.slug);
  revalidateCategoryCache(product.categoryId);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/category/[slug]", "page");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath(`/admin/products/${product.id}`);
}
async function cleanupFailedUpload(adminId: string, intentId: string) {
  await discardUploadIntent(adminId, intentId, "PRODUCT_IMAGE").catch((error) => logger.error("product_image_orphan_cleanup_failed", { errorName: error instanceof Error ? error.name : "UnknownError" }));
}
async function result(operationName: string, operation: () => Promise<{ id: string; slug: string; categoryId: string }>, message: string, cleanup?: () => Promise<void>): Promise<ActionResult<Data>> { try { const product = await operation(); refresh(product); return actionSuccess({ productId: product.id }, message); } catch (error) { await cleanup?.(); if (error instanceof AppError) return actionFailure(error.code, error.message); logger.error("product_image_action_failed", { operation: operationName, errorName: error instanceof Error ? error.name : "UnknownError", validationIssues: validationIssueSummary(error) }); return actionFailure("INTERNAL_ERROR", "Product image could not be updated"); } }

export async function attachProductImageAction(form: FormData): Promise<ActionResult<Data>> {
  const session = await requireAdmin();
  const intentId = text(form, "intentId");
  const parsed = attachProductImageSchema.safeParse({ productId: text(form, "productId"), intentId, alt: text(form, "alt"), fitMode: text(form, "fitMode") || undefined, crop: crop(form) });
  if (!parsed.success) { await cleanupFailedUpload(session.user.id, intentId); return actionFailure("VALIDATION_ERROR", "Add valid alt text before attaching the image"); }
  return result("attach", () => attachProductImage(session.user.id, parsed.data.productId, parsed.data.intentId, parsed.data.alt, parsed.data.fitMode, parsed.data.crop), "Product image attached", () => cleanupFailedUpload(session.user.id, parsed.data.intentId));
}
export async function removeProductImageAction(form: FormData) { await requireAdmin(); const parsed = productImageTargetSchema.safeParse({ productId: text(form, "productId"), publicId: text(form, "publicId") }); if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid product image"); return result("remove", () => removeProductImage(parsed.data.productId, parsed.data.publicId), "Image removed; the original provider asset was preserved"); }
export async function orderProductImageAction(form: FormData) { await requireAdmin(); const parsed = orderProductImageSchema.safeParse({ productId: text(form, "productId"), publicId: text(form, "publicId"), direction: text(form, "direction") }); if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid product image order"); return result("order", () => orderProductImage(parsed.data.productId, parsed.data.publicId, parsed.data.direction), "Image order updated"); }
export async function requestProductImageEnhancementAction(form: FormData) { await requireAdmin(); const parsed = productImageTargetSchema.safeParse({ productId: text(form, "productId"), publicId: text(form, "publicId") }); if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid product image"); return result("request_background_removal", () => requestProductImageEnhancement(parsed.data.productId, parsed.data.publicId), "Enhanced preview is ready for review"); }
export async function approveProductImageAction(form: FormData) { await requireAdmin(); const parsed = approveProductImageSchema.safeParse({ productId: text(form, "productId"), publicId: text(form, "publicId"), source: text(form, "source") }); if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid product image approval"); return result("approve", () => approveProductImage(parsed.data.productId, parsed.data.publicId, parsed.data.source), parsed.data.source === "ENHANCED" ? "Enhanced image approved" : "Original image retained"); }
