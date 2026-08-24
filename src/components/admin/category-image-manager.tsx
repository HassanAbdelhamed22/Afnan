"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AdminImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { attachCategoryImageAction, removeCategoryImageAction } from "@/modules/categories/image-actions";
import { discardClientUpload, uploadManagedImage } from "@/modules/uploads/client";
import { applyCloudinaryCrop, resolveImageFitMode, type ImageCrop, type ImageFitMode } from "@/modules/uploads/presentation";
import { CATEGORY_IMAGE_TYPES, MAX_CATEGORY_IMAGE_BYTES } from "@/modules/uploads/schemas";
import type { MediaAsset } from "@/modules/uploads/types";

export function CategoryImageManager({ categoryId, categoryName, image }: { categoryId: string; categoryName: string; image?: MediaAsset }) {
  const router = useRouter();
  const [file, setFile] = useState<File>();
  const [alt, setAlt] = useState(image?.alt ?? `${categoryName} handmade collection`);
  const [crop, setCrop] = useState<ImageCrop>();
  const [fitMode, setFitMode] = useState<ImageFitMode>("COVER");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");

  const attach = () => startTransition(async () => {
    if (!file) { setFieldError("Choose an image before attaching it."); return; }
    if (alt.trim().length < 3) { setFieldError("Alt text is required and must contain at least 3 characters."); return; }
    if (fitMode === "COVER" && !crop) { setFieldError("Review the fill-frame composition before attaching the image."); return; }
    let intentId: string | undefined;
    try {
      setFieldError(""); setMessage("Uploading category image…");
      intentId = await uploadManagedImage(file, "CATEGORY_IMAGE");
      const form = new FormData(); form.set("categoryId", categoryId); form.set("intentId", intentId); form.set("alt", alt); form.set("fitMode", fitMode); if (crop) form.set("crop", JSON.stringify(crop));
      const result = await attachCategoryImageAction(form);
      if (!result.ok) throw new Error(result.error.message);
      setFile(undefined); setCrop(undefined); setFitMode("COVER"); setMessage(result.message ?? "Category image attached"); router.refresh();
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
      <p className="body-sm mt-3 max-w-3xl text-on-surface-variant">Categories use one consistent square composition across storefront breakpoints.</p>
      {image ? <div className="mt-6"><p className="mb-2 label-caps">Actual storefront composition · {resolveImageFitMode(image.presentation).toLowerCase()}</p><div className="relative aspect-square max-w-80 overflow-hidden border border-outline-variant bg-[#F7F7F5]"><Image src={resolveImageFitMode(image.presentation) === "COVER" ? applyCloudinaryCrop(image.url, image.width, image.height, image.presentation?.crop) : image.url} alt={image.alt ?? categoryName} fill sizes="320px" className={resolveImageFitMode(image.presentation) === "STRETCH" ? "object-fill" : "object-contain"} /></div></div> : null}
      <div className="mt-6">
        <AdminImageUploadField file={file} alt={alt} crop={crop} fitMode={fitMode} onFileChange={setFile} onAltChange={(value) => { setAlt(value); if (value.trim().length >= 3) setFieldError(""); }} onCropChange={setCrop} onFitModeChange={setFitMode} accept={CATEGORY_IMAGE_TYPES} maxBytes={MAX_CATEGORY_IMAGE_BYTES} aspect={1} frameLabel="square category" recommendedWidth={1200} recommendedHeight={1200} disabled={pending} error={fieldError} />
        <div className="mt-4 flex flex-wrap justify-end gap-5"><Button type="button" onClick={attach} disabled={pending || !file}>{pending ? "Working…" : image ? "Upload replacement" : "Upload and attach image"}</Button>{image ? <Button type="button" variant="text" onClick={remove} disabled={pending}>Remove image</Button> : null}</div>
      </div>
      {message ? <p role="status" className="mt-4 body-sm text-on-surface-variant">{message}</p> : null}
    </section>
  );
}
