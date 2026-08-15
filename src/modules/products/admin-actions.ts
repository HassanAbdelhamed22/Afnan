"use server";

import { revalidatePath } from "next/cache";

import { AppError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireAdmin } from "@/modules/auth/dal";
import { revalidateProductCache, revalidateCategoryCache } from "@/modules/catalog/queries";

import { saveAdminProduct, setAdminProductStatus } from "./admin-repository";
import { productAdminInputSchema, productStatusInputSchema } from "./admin-schemas";

type ProductActionData = { productId: string } | null;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optionalInteger(value: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

function money(value: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return Number.NaN;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function list(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export async function saveProductAction(_state: ActionResult<ProductActionData>, formData: FormData): Promise<ActionResult<ProductActionData>> {
  await requireAdmin();
  let variants: unknown = [];
  try { variants = JSON.parse(text(formData, "variants")); } catch { variants = []; }
  const width = optionalInteger(text(formData, "width"));
  const height = optionalInteger(text(formData, "height"));
  const depth = optionalInteger(text(formData, "depth"));
  const parsed = productAdminInputSchema.safeParse({
    id: text(formData, "productId") || undefined,
    name: text(formData, "name"), slug: text(formData, "slug"), description: text(formData, "description"),
    categoryId: text(formData, "categoryId"), status: text(formData, "status"), fulfillmentType: text(formData, "fulfillmentType"),
    basePriceAmount: money(text(formData, "basePrice")), materials: list(text(formData, "materials")),
    colors: list(text(formData, "colors")), tags: list(text(formData, "tags")),
    dimensions: width || height || depth ? { width, height, depth, unit: "cm" } : undefined,
    personalizationAvailable: formData.get("personalizationAvailable") === "on",
    personalizationInstructions: text(formData, "personalizationInstructions") || undefined,
    preparationDaysMin: optionalInteger(text(formData, "preparationDaysMin")),
    preparationDaysMax: optionalInteger(text(formData, "preparationDaysMax")),
    careInstructions: text(formData, "careInstructions") || undefined,
    variants, isFeatured: formData.get("isFeatured") === "on",
  });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Please correct the product details", getZodFieldErrors(parsed.error));
  try {
    const saved = await saveAdminProduct(parsed.data);
    revalidateProductCache(saved.id, saved.slug);
    revalidateCategoryCache(saved.categoryId);
    if (saved.previous) {
      if (saved.previous.slug !== saved.slug) revalidateProductCache(saved.id, saved.previous.slug);
      if (saved.previous.categoryId !== saved.categoryId) revalidateCategoryCache(saved.previous.categoryId);
    }
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${saved.id}`);
    return actionSuccess({ productId: saved.id }, parsed.data.id ? "Product updated" : "Product created");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "Product could not be saved");
  }
}

export async function changeProductStatusAction(formData: FormData): Promise<ActionResult<ProductActionData>> {
  await requireAdmin();
  const parsed = productStatusInputSchema.safeParse({ productId: text(formData, "productId"), status: text(formData, "status") });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid product status request");
  try {
    const product = await setAdminProductStatus(parsed.data.productId, parsed.data.status);
    revalidateProductCache(product.id, product.slug);
    revalidateCategoryCache(product.categoryId);
    revalidatePath("/admin/products");
    return actionSuccess({ productId: product.id }, "Product status updated");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "Product status could not be updated");
  }
}
