"use client";

import { startTransition, useActionState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/results/action-result";
import { saveCategoryAction } from "@/modules/categories/admin-actions";
import type { AdminCategoryDTO } from "@/modules/categories/admin-dto";

type Data = { categoryId: string } | null;
const initialState: ActionResult<Data> = { ok: true, data: null };

export function CategoryForm({ category }: { category?: AdminCategoryDTO }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveCategoryAction, initialState);
  const errors = state.ok ? undefined : state.error.fieldErrors;
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }
  useEffect(() => { if (state.ok && state.data?.categoryId && !category) router.replace(`/admin/categories/${state.data.categoryId}`); }, [category, router, state]);
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
      {!state.ok ? <p role="alert" className="mt-6 border-l-2 border-error bg-error-container/30 px-4 py-3 body-sm text-error">{state.error.message}</p> : state.message ? <p role="status" className="mt-6 border-l-2 border-primary bg-surface-container-low px-4 py-3 body-sm">{state.message}</p> : null}
      <div className="mt-8 flex justify-end border-t border-outline-variant pt-6"><Button type="submit" disabled={pending}>{pending ? "Saving…" : category ? "Save category" : "Create category"}</Button></div>
    </form>
  );
}
