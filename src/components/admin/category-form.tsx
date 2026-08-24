"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";

import { AdminImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/results/action-result";
import { saveCategoryAction } from "@/modules/categories/admin-actions";
import type { AdminCategoryDTO } from "@/modules/categories/admin-dto";
import { attachCategoryImageAction } from "@/modules/categories/image-actions";
import { discardClientUpload, uploadManagedImage } from "@/modules/uploads/client";
import type { ImageCrop, ImageFitMode } from "@/modules/uploads/presentation";
import { CATEGORY_IMAGE_TYPES, MAX_CATEGORY_IMAGE_BYTES } from "@/modules/uploads/schemas";

type Data = { categoryId: string } | null;
const initialState: ActionResult<Data> = { ok: true, data: null };

export function CategoryForm({ category }: { category?: AdminCategoryDTO }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveCategoryAction, initialState);
  const [creationFile, setCreationFile] = useState<File>();
  const [creationAlt, setCreationAlt] = useState("");
  const [creationCrop, setCreationCrop] = useState<ImageCrop>();
  const [creationFitMode, setCreationFitMode] = useState<ImageFitMode>("COVER");
  const [creationImageError, setCreationImageError] = useState("");
  const [stagedIntentId, setStagedIntentId] = useState("");
  const [uploading, setUploading] = useState(false);
  const completedCategoryId = useRef("");
  const errors = state.ok ? undefined : state.error.fieldErrors;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!category && creationFile && creationAlt.trim().length < 3) { setCreationImageError("Alt text is required and must contain at least 3 characters."); return; }
    if (!category && creationFile && creationFitMode === "COVER" && !creationCrop) { setCreationImageError("Review the fill-frame composition before creating the category."); return; }
    startTransition(async () => {
      try {
        setCreationImageError("");
        if (!category && creationFile) { setUploading(true); const intentId = await uploadManagedImage(creationFile, "CATEGORY_IMAGE"); setStagedIntentId(intentId); }
        startTransition(() => action(formData));
      } catch (error) { setCreationImageError(error instanceof Error ? error.message : "The image could not be uploaded."); }
      finally { setUploading(false); }
    });
  }

  useEffect(() => {
    const categoryId = state.ok ? state.data?.categoryId : undefined;
    if (!categoryId || category || completedCategoryId.current === categoryId) return;
    completedCategoryId.current = categoryId;
    void (async () => {
      if (stagedIntentId) {
        const imageForm = new FormData(); imageForm.set("categoryId", categoryId); imageForm.set("intentId", stagedIntentId); imageForm.set("alt", creationAlt); imageForm.set("fitMode", creationFitMode); if (creationCrop) imageForm.set("crop", JSON.stringify(creationCrop));
        const attached = await attachCategoryImageAction(imageForm);
        if (!attached.ok) { router.replace(`/admin/categories/${categoryId}?image=failed`); return; }
      }
      router.replace(`/admin/categories/${categoryId}`);
    })();
  }, [category, creationAlt, creationCrop, creationFitMode, router, stagedIntentId, state]);

  useEffect(() => {
    if (state.ok || !stagedIntentId) return;
    void discardClientUpload(stagedIntentId).catch(() => undefined);
  }, [stagedIntentId, state]);

  return (
    <form onSubmit={handleSubmit} className="border border-outline-variant bg-surface p-6" noValidate>
      <input type="hidden" name="categoryId" value={category?.id ?? ""} />
      <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
        <FormField htmlFor="category-name" label="Name" error={errors?.name?.[0]}><Input id="category-name" name="name" defaultValue={category?.name} required /></FormField>
        <FormField htmlFor="category-slug" label="Slug" hint="This becomes the category's web address. Use short lowercase words joined by hyphens, for example: woven-bags. Avoid changing it after publishing because old links may stop working." error={errors?.slug?.[0]}><Input id="category-slug" name="slug" defaultValue={category?.slug} placeholder="woven-bags" required /></FormField>
        <FormField htmlFor="category-description" label="Description" error={errors?.description?.[0]} className="md:col-span-2"><textarea id="category-description" name="description" rows={4} defaultValue={category?.description} className="w-full border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary" /></FormField>
        <FormField htmlFor="category-order" label="Sort order" hint="Controls where the category appears in navigation. Lower numbers appear first; for example, 10 appears before 20." error={errors?.sortOrder?.[0]}><Input id="category-order" name="sortOrder" type="number" min="0" defaultValue={category?.sortOrder ?? 0} required /></FormField>
        <Checkbox name="isActive" label="Active in the storefront" defaultChecked={category?.isActive ?? true} className="self-end pb-1" />
      </div>
      {!category ? <div className="mt-8"><AdminImageUploadField file={creationFile} alt={creationAlt} crop={creationCrop} fitMode={creationFitMode} onFileChange={setCreationFile} onAltChange={(value) => { setCreationAlt(value); if (value.trim().length >= 3) setCreationImageError(""); }} onCropChange={setCreationCrop} onFitModeChange={setCreationFitMode} accept={CATEGORY_IMAGE_TYPES} maxBytes={MAX_CATEGORY_IMAGE_BYTES} aspect={1} frameLabel="square category" recommendedWidth={1200} recommendedHeight={1200} disabled={pending || uploading} error={creationImageError} /></div> : null}
      {!state.ok ? <p role="alert" className="mt-6 border-l-2 border-error bg-error-container/30 px-4 py-3 body-sm text-error">{state.error.message}</p> : state.message ? <p role="status" className="mt-6 border-l-2 border-primary bg-surface-container-low px-4 py-3 body-sm">{state.message}</p> : null}
      <div className="mt-8 flex justify-end border-t border-outline-variant pt-6"><Button type="submit" disabled={pending || uploading}>{uploading ? "Uploading image…" : pending ? "Saving…" : category ? "Save category" : creationFile ? "Create category with image" : "Create category"}</Button></div>
    </form>
  );
}
