"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { createCustomRequestAction } from "@/modules/custom-requests/actions";
import { customRequestSchema } from "@/modules/custom-requests/schemas";
import { discardClientUpload, uploadManagedImage } from "@/modules/uploads/client";
import { CUSTOM_REQUEST_IMAGE_TYPES, MAX_CUSTOM_REQUEST_IMAGES, MAX_CUSTOM_REQUEST_IMAGE_BYTES } from "@/modules/uploads/schemas";

type FieldErrors = Record<string, string[]>;

export function CustomRequestForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [progress, setProgress] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setErrors({});
    const baseInput = {
      title: form.get("title"), description: form.get("description"), material: form.get("material"),
      colors: form.get("colors"), dimensions: form.get("dimensions"), quantity: form.get("quantity"),
      desiredDate: form.get("desiredDate"), budgetMinAmount: form.get("budgetMinAmount"),
      budgetMaxAmount: form.get("budgetMaxAmount"), uploadIntentIds: [] as string[],
    };
    const locallyParsed = customRequestSchema.safeParse(baseInput);
    if (!locallyParsed.success) {
      setErrors(locallyParsed.error.flatten().fieldErrors);
      toast.show("Please correct the request details", "error");
      return;
    }
    startTransition(async () => {
      const uploadIntentIds: string[] = [];
      try {
        for (const [index, file] of files.entries()) {
          setProgress(`Uploading image ${index + 1} of ${files.length}…`);
          uploadIntentIds.push(await uploadManagedImage(file, "CUSTOM_REQUEST_REFERENCE"));
        }
        setProgress("Submitting your request…");
        const result = await createCustomRequestAction({ ...baseInput, uploadIntentIds });
        if (!result.ok) {
          await Promise.all(uploadIntentIds.map((intentId) => discardClientUpload(intentId).catch(() => undefined)));
          setErrors(result.error.fieldErrors ?? {});
          toast.show(result.error.message, "error");
          return;
        }
        toast.show(result.message ?? "Custom request submitted", "success");
        router.push(`/account/custom-requests?submitted=${encodeURIComponent(result.data.requestNumber)}`);
      } catch (error) {
        await Promise.all(uploadIntentIds.map((intentId) => discardClientUpload(intentId).catch(() => undefined)));
        toast.show(error instanceof Error ? error.message : "The request could not be submitted", "error");
      } finally {
        setProgress("");
      }
    });
  };

  return (
    <form onSubmit={submit} className="border border-outline-variant bg-surface p-6 sm:p-8" noValidate>
      <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
        <FormField htmlFor="request-title" label="Request title" error={errors.title?.[0]} className="md:col-span-2"><Input id="request-title" name="title" required placeholder="For example, embroidered linen table runner" /></FormField>
        <FormField htmlFor="request-description" label="Describe your idea" error={errors.description?.[0]} className="md:col-span-2"><textarea id="request-description" name="description" rows={6} required className="w-full resize-y border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary" placeholder="Describe the style, intended use, important details, and anything the maker should know." /></FormField>
        <FormField htmlFor="request-material" label="Preferred material (optional)" error={errors.material?.[0]}><Input id="request-material" name="material" /></FormField>
        <FormField htmlFor="request-colors" label="Preferred colors (optional)" error={errors.colors?.[0]}><Input id="request-colors" name="colors" placeholder="Blue, cream, gold" /></FormField>
        <FormField htmlFor="request-dimensions" label="Dimensions (optional)" error={errors.dimensions?.[0]}><Input id="request-dimensions" name="dimensions" placeholder="For example, 40 × 60 cm" /></FormField>
        <FormField htmlFor="request-quantity" label="Quantity" error={errors.quantity?.[0]}><Input id="request-quantity" name="quantity" type="number" min={1} max={99} defaultValue={1} required /></FormField>
        <FormField htmlFor="request-date" label="Desired date (optional)" error={errors.desiredDate?.[0]}><Input id="request-date" name="desiredDate" type="date" min={new Date().toISOString().slice(0, 10)} /></FormField>
        <div className="grid grid-cols-2 gap-5"><FormField htmlFor="budget-min" label="Min budget EGP" error={errors.budgetMinAmount?.[0]}><Input id="budget-min" name="budgetMinAmount" type="number" min={0} step="0.01" /></FormField><FormField htmlFor="budget-max" label="Max budget EGP" error={errors.budgetMaxAmount?.[0]}><Input id="budget-max" name="budgetMaxAmount" type="number" min={0} step="0.01" /></FormField></div>
        <FormField htmlFor="reference-images" label="Reference images (optional)" className="md:col-span-2">
          <input id="reference-images" type="file" accept={CUSTOM_REQUEST_IMAGE_TYPES.join(",")} multiple disabled={pending} onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            if (selected.length > MAX_CUSTOM_REQUEST_IMAGES) { toast.show(`Choose up to ${MAX_CUSTOM_REQUEST_IMAGES} images`, "error"); event.target.value = ""; return; }
            const invalid = selected.find((file) => !CUSTOM_REQUEST_IMAGE_TYPES.includes(file.type as typeof CUSTOM_REQUEST_IMAGE_TYPES[number]) || file.size > MAX_CUSTOM_REQUEST_IMAGE_BYTES);
            if (invalid) { toast.show("Use JPEG, PNG, or WebP images up to 5 MB each", "error"); event.target.value = ""; return; }
            setFiles(selected);
          }} className="block w-full border border-outline-variant bg-background p-4 body-sm file:mr-4 file:border file:border-primary file:bg-transparent file:px-4 file:py-2 file:label-caps" />
          <p className="mt-2 body-sm text-on-surface-variant">Up to 5 JPEG, PNG, or WebP images, 5 MB each.</p>
          {files.length > 0 && <ul className="mt-3 space-y-1 body-sm text-on-surface-variant">{files.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</li>)}</ul>}
        </FormField>
      </div>
      <div className="mt-8 border-t border-outline-variant pt-6"><Button type="submit" disabled={pending} aria-busy={pending}>{pending ? progress || "Submitting…" : "Submit custom request"}</Button></div>
    </form>
  );
}
