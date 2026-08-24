"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AdminImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/results/action-result";
import { approveProductImageAction, attachProductImageAction, orderProductImageAction, removeProductImageAction, requestProductImageEnhancementAction } from "@/modules/products/image-actions";
import { discardClientUpload, uploadManagedImage } from "@/modules/uploads/client";
import { applyCloudinaryCrop, resolveImageFitMode, type ImageCrop, type ImageFitMode } from "@/modules/uploads/presentation";
import { MAX_PRODUCT_IMAGE_BYTES, MAX_PRODUCT_IMAGES, PRODUCT_IMAGE_TYPES } from "@/modules/uploads/schemas";
import type { MediaAsset } from "@/modules/uploads/types";

type ImageAction = (formData: FormData) => Promise<ActionResult<{ productId: string } | null>>;

function ImageActionButton({ action, fields, children, disabled }: { action: ImageAction; fields: Record<string, string>; children: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <div><Button type="button" variant="text" disabled={disabled || pending} onClick={() => startTransition(async () => { const form = new FormData(); Object.entries(fields).forEach(([key, value]) => form.set(key, value)); const response = await action(form); if (!response.ok) setError(response.error.message); else { setError(""); router.refresh(); } })}>{pending ? "Working…" : children}</Button>{error ? <p role="alert" className="mt-1 max-w-60 body-sm text-error">{error}</p> : null}</div>;
}

function storefrontUrl(image: MediaAsset) {
  const source = image.presentation?.source === "ENHANCED" && image.presentation.enhancedApproved && image.enhancedUrl ? image.enhancedUrl : image.url;
  return resolveImageFitMode(image.presentation) === "COVER" ? applyCloudinaryCrop(source, image.width, image.height, image.presentation?.crop) : source;
}

function composedUrl(image: MediaAsset, source: "ORIGINAL" | "ENHANCED") {
  const url = source === "ENHANCED" && image.enhancedUrl ? image.enhancedUrl : image.url;
  return resolveImageFitMode(image.presentation) === "COVER" ? applyCloudinaryCrop(url, image.width, image.height, image.presentation?.crop) : url;
}

const transparencyBackground = {
  backgroundColor: "#F7F7F5",
  backgroundImage: "linear-gradient(45deg, rgb(215 215 211) 25%, transparent 25%), linear-gradient(-45deg, rgb(215 215 211) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(215 215 211) 75%), linear-gradient(-45deg, transparent 75%, rgb(215 215 211) 75%)",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
  backgroundSize: "20px 20px",
} as const;

export function ProductImageManager({ productId, images }: { productId: string; images: MediaAsset[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File>();
  const [alt, setAlt] = useState("");
  const [crop, setCrop] = useState<ImageCrop>();
  const [fitMode, setFitMode] = useState<ImageFitMode>("CONTAIN");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");

  const add = () => startTransition(async () => {
    if (!file) { setFieldError("Choose an image before attaching it."); return; }
    if (alt.trim().length < 3) { setFieldError("Alt text is required and must contain at least 3 characters."); return; }
    if (fitMode === "COVER" && !crop) { setFieldError("Review the fill-frame composition before attaching the image."); return; }
    let intentId: string | undefined;
    try {
      setFieldError(""); setMessage("Uploading original image…");
      intentId = await uploadManagedImage(file, "PRODUCT_IMAGE");
      const form = new FormData(); form.set("productId", productId); form.set("intentId", intentId); form.set("alt", alt); form.set("fitMode", fitMode); if (crop) form.set("crop", JSON.stringify(crop));
      const result = await attachProductImageAction(form);
      if (!result.ok) throw new Error(result.error.message);
      setFile(undefined); setAlt(""); setCrop(undefined); setFitMode("CONTAIN"); setMessage(result.message ?? "Image attached"); router.refresh();
    } catch (error) {
      if (intentId) await discardClientUpload(intentId).catch(() => undefined);
      setMessage(error instanceof Error ? error.message : "Product image could not be attached");
    }
  });

  return (
    <section className="mt-10 border border-outline-variant bg-surface p-6">
      <p className="label-caps text-on-surface-variant">Product presentation</p><h2 className="headline-sm mt-2">Images and background removal</h2>
      <p className="body-sm mt-3 max-w-3xl text-on-surface-variant">Originals are always preserved. Every composition and enhanced result is previewed before it is used in the storefront.</p>
      <div className="mt-6">
        <AdminImageUploadField file={file} alt={alt} crop={crop} fitMode={fitMode} onFileChange={setFile} onAltChange={(value) => { setAlt(value); if (value.trim().length >= 3) setFieldError(""); }} onCropChange={setCrop} onFitModeChange={setFitMode} accept={PRODUCT_IMAGE_TYPES} maxBytes={MAX_PRODUCT_IMAGE_BYTES} aspect={4 / 5} frameLabel="4:5 product" recommendedWidth={1200} recommendedHeight={1500} disabled={pending || images.length >= MAX_PRODUCT_IMAGES} error={fieldError} />
        <div className="mt-4 flex justify-end"><Button type="button" onClick={add} disabled={pending || !file || images.length >= MAX_PRODUCT_IMAGES}>{pending ? "Uploading…" : "Upload and attach image"}</Button></div>
      </div>
      {message ? <p role="status" className="mt-3 body-sm text-on-surface-variant">{message}</p> : null}
      <div className="mt-7 space-y-7">
        {images.map((image, index) => {
          const status = image.presentation?.backgroundRemovalStatus ?? "NOT_REQUESTED";
          const enhancedReady = status === "READY" && Boolean(image.enhancedUrl);
          const enhancedSelected = image.presentation?.source === "ENHANCED" && image.presentation.enhancedApproved;
          const fitMode = resolveImageFitMode(image.presentation);
          return <article key={image.publicId} className="border border-outline-variant p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant pb-4"><div><p className="label-caps">Image {index + 1}{image.isPrimary ? " · Primary" : ""}</p><p className="body-sm mt-1 text-on-surface-variant">{image.alt}</p></div><span className="border border-outline-variant px-2 py-1 label-caps">{status.replaceAll("_", " ")}</span></div>
            <div className={`mt-5 grid gap-5 ${enhancedReady ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-2"}`}>
              <figure><figcaption className="mb-2 label-caps">Untouched original</figcaption><div className="relative aspect-[4/5] bg-[#F7F7F5]"><Image src={image.url} alt={image.alt ?? "Original product image"} fill sizes="(max-width:1024px) 100vw, 40vw" className="object-contain p-6" /></div></figure>
              {enhancedReady ? <figure><figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2 label-caps"><span>Background-removed preview</span><span className="text-on-surface-variant">{enhancedSelected ? "Selected" : "Preview only"}</span></figcaption><div className="relative aspect-[4/5] overflow-hidden border border-outline-variant" style={transparencyBackground}><Image src={composedUrl(image, "ENHANCED")} alt={`${image.alt ?? "Product"} with background removed`} fill sizes="(max-width:1280px) 50vw, 30vw" className={fitMode === "STRETCH" ? "object-fill" : "object-contain"} /></div><p className="mt-2 body-sm text-on-surface-variant">The checkerboard shows transparent areas removed by Cloudinary.</p></figure> : null}
              <figure><figcaption className="mb-2 label-caps">Current storefront · {enhancedSelected ? "enhanced" : "original"} · {fitMode.toLowerCase()}</figcaption><div className="relative aspect-[4/5] border border-outline-variant bg-[#F7F7F5]"><Image src={storefrontUrl(image)} alt={image.alt ?? "Product storefront preview"} fill sizes="(max-width:1280px) 50vw, 30vw" className={fitMode === "STRETCH" ? "object-fill" : "object-contain"} /></div></figure>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-outline-variant pt-4">
              {!image.isPrimary ? <ImageActionButton action={orderProductImageAction} fields={{ productId, publicId: image.publicId, direction: "PRIMARY" }}>Make primary</ImageActionButton> : null}
              {index > 0 ? <ImageActionButton action={orderProductImageAction} fields={{ productId, publicId: image.publicId, direction: "UP" }}>Move up</ImageActionButton> : null}
              {index < images.length - 1 ? <ImageActionButton action={orderProductImageAction} fields={{ productId, publicId: image.publicId, direction: "DOWN" }}>Move down</ImageActionButton> : null}
              <ImageActionButton action={requestProductImageEnhancementAction} fields={{ productId, publicId: image.publicId }} disabled={status === "PROCESSING"}>{status === "FAILED" ? "Retry removal" : "Remove background"}</ImageActionButton>
              <ImageActionButton action={approveProductImageAction} fields={{ productId, publicId: image.publicId, source: "ENHANCED" }} disabled={!enhancedReady || enhancedSelected}>{enhancedSelected ? "Enhanced in use" : "Use enhanced"}</ImageActionButton>
              <ImageActionButton action={approveProductImageAction} fields={{ productId, publicId: image.publicId, source: "ORIGINAL" }} disabled={!enhancedSelected}>Keep original</ImageActionButton>
              <ImageActionButton action={removeProductImageAction} fields={{ productId, publicId: image.publicId }}>Remove reference</ImageActionButton>
            </div>
            <p className="mt-4 body-sm text-on-surface-variant">Storefront source: <strong>{enhancedSelected ? "Approved enhanced image" : "Original image"}</strong></p>
          </article>;
        })}
        {!images.length ? <p className="border border-dashed border-outline-variant px-6 py-10 text-center body-md text-on-surface-variant">No product images yet. Add an original before publishing.</p> : null}
      </div>
    </section>
  );
}
