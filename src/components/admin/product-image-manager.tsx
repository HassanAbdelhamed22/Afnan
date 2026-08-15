"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/results/action-result";
import type { MediaAsset } from "@/modules/uploads/types";
import { MAX_PRODUCT_IMAGE_BYTES, MAX_PRODUCT_IMAGES, PRODUCT_IMAGE_TYPES } from "@/modules/uploads/schemas";
import { discardClientUpload, uploadManagedImage } from "@/modules/uploads/client";
import { approveProductImageAction, attachProductImageAction, orderProductImageAction, removeProductImageAction, requestProductImageEnhancementAction } from "@/modules/products/image-actions";

type ImageAction = (formData: FormData) => Promise<ActionResult<{ productId: string } | null>>;

function ImageActionButton({ action, fields, children, disabled }: { action: ImageAction; fields: Record<string, string>; children: string; disabled?: boolean }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [error, setError] = useState("");
  return <div><Button type="button" variant="text" disabled={disabled || pending} onClick={() => startTransition(async () => { const form = new FormData(); Object.entries(fields).forEach(([key, value]) => form.set(key, value)); const response = await action(form); if (!response.ok) setError(response.error.message); else { setError(""); router.refresh(); } })}>{pending ? "Working…" : children}</Button>{error ? <p role="alert" className="mt-1 max-w-60 body-sm text-error">{error}</p> : null}</div>;
}

export function ProductImageManager({ productId, images }: { productId: string; images: MediaAsset[] }) {
  const router = useRouter(); const [file, setFile] = useState<File>(); const [alt, setAlt] = useState(""); const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  const add = () => startTransition(async () => {
    if (!file || alt.trim().length < 3) { setMessage("Choose an image and provide meaningful alt text."); return; }
    let intentId: string | undefined;
    try { setMessage("Uploading original image…"); intentId = await uploadManagedImage(file, "PRODUCT_IMAGE"); const form = new FormData(); form.set("productId", productId); form.set("intentId", intentId); form.set("alt", alt); const result = await attachProductImageAction(form); if (!result.ok) throw new Error(result.error.message); setFile(undefined); setAlt(""); setMessage(result.message ?? "Image attached"); router.refresh(); }
    catch (error) { if (intentId) await discardClientUpload(intentId).catch(() => undefined); setMessage(error instanceof Error ? error.message : "Product image could not be attached"); }
  });
  return (
    <section className="mt-10 border border-outline-variant bg-surface p-6">
      <p className="label-caps text-on-surface-variant">Product presentation</p><h2 className="headline-sm mt-2">Images and background removal</h2>
      <p className="body-sm mt-3 max-w-3xl text-on-surface-variant">Originals are always preserved. Fine threads, glass, shadows, reflections, and light-colored edges may produce imperfect removal, so every enhanced result requires explicit approval.</p>
      <div className="mt-6 grid gap-5 border-y border-outline-variant bg-surface-container-low px-5 py-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label><span className="label-caps">Original image</span><input type="file" accept={PRODUCT_IMAGE_TYPES.join(",")} disabled={pending || images.length >= MAX_PRODUCT_IMAGES} className="mt-2 block w-full body-sm" onChange={(event) => { const selected = event.target.files?.[0]; if (selected && (!PRODUCT_IMAGE_TYPES.includes(selected.type as typeof PRODUCT_IMAGE_TYPES[number]) || selected.size > MAX_PRODUCT_IMAGE_BYTES)) { setMessage("Use JPEG, PNG, or WebP up to 8 MB."); event.target.value = ""; return; } setFile(selected); }} /></label>
        <label><span className="label-caps">Alt text</span><input value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={300} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm outline-none focus:border-primary" /></label>
        <Button type="button" onClick={add} disabled={pending || !file || images.length >= MAX_PRODUCT_IMAGES}>{pending ? "Uploading…" : "Attach image"}</Button>
      </div>
      {message ? <p role="status" className="mt-3 body-sm text-on-surface-variant">{message}</p> : null}
      <div className="mt-7 space-y-7">
        {images.map((image, index) => {
          const status = image.presentation?.backgroundRemovalStatus ?? "NOT_REQUESTED";
          return <article key={image.publicId} className="border border-outline-variant p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant pb-4"><div><p className="label-caps">Image {index + 1}{image.isPrimary ? " · Primary" : ""}</p><p className="body-sm mt-1 text-on-surface-variant">{image.alt}</p></div><span className="border border-outline-variant px-2 py-1 label-caps">{status.replaceAll("_", " ")}</span></div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <figure><figcaption className="mb-2 label-caps">Original</figcaption><div className="relative aspect-[4/5] bg-[#F7F7F5] p-6"><Image src={image.url} alt={image.alt ?? "Original product image"} fill sizes="(max-width:1024px) 100vw, 40vw" className="object-contain p-6" /></div></figure>
              <figure><figcaption className="mb-2 label-caps">Enhanced preview</figcaption><div className="relative aspect-[4/5] border border-outline-variant bg-[#F7F7F5] p-6">{image.enhancedUrl ? <Image src={image.enhancedUrl} alt={`${image.alt ?? "Product"} background removed preview`} fill sizes="(max-width:1024px) 100vw, 40vw" className="object-contain p-6" /> : <p className="absolute inset-0 grid place-items-center px-8 text-center body-sm text-on-surface-variant">No enhanced preview requested.</p>}</div></figure>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-outline-variant pt-4">
              {!image.isPrimary ? <ImageActionButton action={orderProductImageAction} fields={{ productId, publicId: image.publicId, direction: "PRIMARY" }}>Make primary</ImageActionButton> : null}
              {index > 0 ? <ImageActionButton action={orderProductImageAction} fields={{ productId, publicId: image.publicId, direction: "UP" }}>Move up</ImageActionButton> : null}
              {index < images.length - 1 ? <ImageActionButton action={orderProductImageAction} fields={{ productId, publicId: image.publicId, direction: "DOWN" }}>Move down</ImageActionButton> : null}
              <ImageActionButton action={requestProductImageEnhancementAction} fields={{ productId, publicId: image.publicId }} disabled={status === "PROCESSING"}>{status === "FAILED" ? "Retry removal" : "Remove background"}</ImageActionButton>
              <ImageActionButton action={approveProductImageAction} fields={{ productId, publicId: image.publicId, source: "ENHANCED" }} disabled={status !== "READY"}>Use enhanced</ImageActionButton>
              <ImageActionButton action={approveProductImageAction} fields={{ productId, publicId: image.publicId, source: "ORIGINAL" }}>Keep original</ImageActionButton>
              <ImageActionButton action={removeProductImageAction} fields={{ productId, publicId: image.publicId }}>Remove reference</ImageActionButton>
            </div>
            <p className="mt-4 body-sm text-on-surface-variant">Storefront source: <strong>{image.presentation?.source === "ENHANCED" && image.presentation.enhancedApproved ? "Approved enhanced image" : "Original image"}</strong></p>
          </article>;
        })}
        {!images.length ? <p className="border border-dashed border-outline-variant px-6 py-10 text-center body-md text-on-surface-variant">No product images yet. Add an original before publishing.</p> : null}
      </div>
    </section>
  );
}
