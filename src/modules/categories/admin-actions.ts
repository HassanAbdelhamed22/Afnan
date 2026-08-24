"use server";

import { revalidatePath } from "next/cache";

import { AppError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireAdmin } from "@/modules/auth/dal";
import { revalidateCategoryCache } from "@/modules/catalog/queries";

import { deleteAdminCategory, saveAdminCategory, setAdminCategoryStatus } from "./admin-repository";
import { categoryAdminInputSchema, categoryDeleteInputSchema, categoryStatusInputSchema } from "./admin-schemas";

type CategoryActionData = { categoryId: string } | null;
function text(formData: FormData, name: string) { const value = formData.get(name); return typeof value === "string" ? value.trim() : ""; }

export async function saveCategoryAction(_state: ActionResult<CategoryActionData>, formData: FormData): Promise<ActionResult<CategoryActionData>> {
  await requireAdmin();
  const parsed = categoryAdminInputSchema.safeParse({
    id: text(formData, "categoryId") || undefined, name: text(formData, "name"), slug: text(formData, "slug"),
    description: text(formData, "description") || undefined, sortOrder: Number(text(formData, "sortOrder")),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Please correct the category details", getZodFieldErrors(parsed.error));
  try {
    const category = await saveAdminCategory(parsed.data);
    revalidateCategoryCache(category.id, category.slug);
    if (category.previousSlug && category.previousSlug !== category.slug) revalidateCategoryCache(category.id, category.previousSlug);
    revalidatePath("/admin/categories");
    return actionSuccess({ categoryId: category.id }, parsed.data.id ? "Category updated" : "Category created");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "Category could not be saved");
  }
}

export async function changeCategoryStatusAction(formData: FormData): Promise<ActionResult<CategoryActionData>> {
  await requireAdmin();
  const parsed = categoryStatusInputSchema.safeParse({ categoryId: text(formData, "categoryId"), isActive: text(formData, "isActive") === "true" });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid category status request");
  try {
    const category = await setAdminCategoryStatus(parsed.data.categoryId, parsed.data.isActive);
    revalidateCategoryCache(category.id, category.slug);
    revalidatePath("/admin/categories");
    return actionSuccess({ categoryId: category.id }, "Category status updated");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "Category status could not be updated");
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionResult<CategoryActionData>> {
  await requireAdmin();
  const parsed = categoryDeleteInputSchema.safeParse({ categoryId: text(formData, "categoryId") });
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid category removal request");
  try {
    const category = await deleteAdminCategory(parsed.data.categoryId);
    revalidateCategoryCache(category.id, category.slug);
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${category.id}`);
    return actionSuccess({ categoryId: category.id }, "Category removed");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "Category could not be removed");
  }
}
