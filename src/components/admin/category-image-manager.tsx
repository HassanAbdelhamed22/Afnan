"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { attachCategoryImageAction, removeCategoryImageAction } from "@/modules/categories/image-actions";
import { CATEGORY_IMAGE_TYPES, MAX_CATEGORY_IMAGE_BYTES } from "@/modules/uploads/schemas";
import { discardClientUpload, uploadManagedImage } from "@/modules/uploads/client";
import type { MediaAsset } from "@/modules/uploads/types";

export function CategoryImageManager({ categoryId, categoryName, image }: { categoryId: string; categoryName: string; image?: MediaAsset }) {
  const router = useRouter();
  const [file, setFile] = useState<File>();
  const [alt, setAlt] = useState(image?.alt ?? `${categoryName} handmade collection`);
  const [inputKey, setInputKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const attach = () => startTransition(async () => {
    if (!file || alt.trim().length < 3) { setMessage("Choose an image and provide meaningful alt text."); return; }
    let intentId: string | undefined;
    try {
      setMessage("Uploading category image…");
      intentId = await uploadManagedImage(file, "CATEGORY_IMAGE");
      const form = new FormData(); form.set("categoryId", categoryId); form.set("intentId", intentId); form.set("alt", alt);
      const result = await attachCategoryImageAction(form);
      if (!result.ok) throw new Error(result.error.message);
      setFile(undefined); setInputKey((value) => value + 1); setMessage(result.message ?? "Category image attached"); router.refresh();
    } catch (error) {
      if (intentId) await discardClientUpload(intentId).catch(() => undefined);
      setMessage(error instanceof Error ? error.message : "Category image could not be attached");
    }
  });

  const remove = () => startTransition(async () => {
    const form = new FormData(); form.set("categoryId", categoryId);
    const result = await removeCategoryImageAction(form);
    if (!result.ok) { setMessage(result.error.message); return; }
    setMessage(result.message ?? "Category image removed"); router.refresh();
  });

  return (
    <section className="mt-8 border border-outline-variant bg-surface p-6">
      <p className="label-caps text-on-surface-variant">Storefront presentation</p>
      <h2 className="headline-sm mt-2">Category image</h2>
      <p className="body-sm mt-3 max-w-3xl text-on-surface-variant">Use a clear, well-lit image that represents the whole collection. A square or 4:5 composition works best across the storefront.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(14rem,20rem)_1fr]">
        <div className="relative aspect-square overflow-hidden border border-outline-variant bg-[#F7F7F5]">
          {image ? <Image src={image.url} alt={image.alt ?? categoryName} fill sizes="320px" className="object-cover" /> : <p className="absolute inset-0 grid place-items-center px-6 text-center body-sm text-on-surface-variant">No category image yet.</p>}
        </div>
        <div className="grid content-start gap-5">
          <label><span className="label-caps">Image file</span><input key={inputKey} type="file" accept={CATEGORY_IMAGE_TYPES.join(",")} disabled={pending} className="mt-2 block w-full body-sm" onChange={(event) => { const selected = event.target.files?.[0]; if (selected && (!CATEGORY_IMAGE_TYPES.includes(selected.type as typeof CATEGORY_IMAGE_TYPES[number]) || selected.size > MAX_CATEGORY_IMAGE_BYTES)) { setMessage("Use JPEG, PNG, or WebP up to 8 MB."); event.target.value = ""; setFile(undefined); return; } setFile(selected); }} /></label>
          <label><span className="label-caps">Alt text</span><span className="mt-1 block body-sm text-on-surface-variant">Briefly describe the image for customers using screen readers.</span><input value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={300} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm outline-none focus:border-primary" /></label>
          <div className="flex flex-wrap items-center gap-5"><Button type="button" onClick={attach} disabled={pending || !file}>{pending ? "Working…" : image ? "Replace image" : "Attach image"}</Button>{image ? <Button type="button" variant="text" onClick={remove} disabled={pending}>Remove image</Button> : null}</div>
        </div>
      </div>
      {message ? <p role="status" className="mt-4 body-sm text-on-surface-variant">{message}</p> : null}
    </section>
  );
}
