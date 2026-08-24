"use client";

import Image from "next/image";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { ImageCrop, ImageFitMode } from "@/modules/uploads/presentation";

interface AdminImageUploadFieldProps {
  file?: File;
  alt: string;
  crop?: ImageCrop;
  fitMode: ImageFitMode;
  onFileChange: (file?: File) => void;
  onAltChange: (alt: string) => void;
  onCropChange: (crop?: ImageCrop) => void;
  onFitModeChange: (fitMode: ImageFitMode) => void;
  accept: readonly string[];
  maxBytes: number;
  aspect: number;
  frameLabel: string;
  recommendedWidth: number;
  recommendedHeight: number;
  disabled?: boolean;
  error?: string;
}

const fitOptions: Array<{ value: ImageFitMode; label: string; description: string }> = [
  { value: "CONTAIN", label: "Fit entire image", description: "Shows the complete image and keeps its proportions. Empty space may remain." },
  { value: "COVER", label: "Fill frame", description: "Fills the storefront frame. Drag and zoom to choose what is cropped." },
  { value: "STRETCH", label: "Stretch", description: "Fills the frame without cropping, but may distort the product." },
];

export function AdminImageUploadField({
  file, alt, crop, fitMode, onFileChange, onAltChange, onCropChange, onFitModeChange,
  accept, maxBytes, aspect, frameLabel, recommendedWidth, recommendedHeight, disabled, error,
}: AdminImageUploadFieldProps) {
  const id = useId();
  const inputId = `${id}-file`;
  const altId = `${id}-alt`;
  const errorId = `${id}-error`;
  const [editorOpen, setEditorOpen] = useState(false);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState<Area>();
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>();
  const [localError, setLocalError] = useState("");
  const objectUrl = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);

  useEffect(() => {
    if (!objectUrl) return;
    const image = new window.Image();
    image.onload = () => setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = objectUrl;
    return () => { image.onload = null; URL.revokeObjectURL(objectUrl); };
  }, [objectUrl]);

  const selectedWidth = fitMode === "COVER" ? pixelCrop?.width : dimensions?.width;
  const selectedHeight = fitMode === "COVER" ? pixelCrop?.height : dimensions?.height;
  const resolutionWarning = Boolean(selectedWidth && selectedHeight && (selectedWidth < recommendedWidth || selectedHeight < recommendedHeight));
  const compositionReady = fitMode !== "COVER" || Boolean(crop);
  const selectedFitOption = fitOptions.find((option) => option.value === fitMode) ?? fitOptions[0];

  function chooseFile(selected?: File) {
    setLocalError("");
    if (!selected) return;
    if (!accept.includes(selected.type) || selected.size > maxBytes) {
      setLocalError(`Choose a JPEG, PNG, or WebP image up to ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      return;
    }
    onFileChange(selected);
    setDimensions(undefined);
    onCropChange(undefined);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setPixelCrop(undefined);
    setEditorOpen(true);
  }

  function selectFitMode(nextMode: ImageFitMode) {
    onFitModeChange(nextMode);
    if (nextMode !== "COVER") onCropChange(undefined);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setPixelCrop(undefined);
    if (nextMode === "COVER") setEditorOpen(true);
  }

  function clearFile() {
    onFileChange(undefined);
    onCropChange(undefined);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setLocalError("");
    setDimensions(undefined);
    setPixelCrop(undefined);
  }

  const visibleError = error || localError;

  return (
    <section className="border border-outline-variant bg-surface-container-low p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps text-on-background">Image</p>
          <p className="mt-2 body-sm text-on-surface-variant">Choose the original, select its display style, preview the {frameLabel} frame, and provide alt text.</p>
        </div>
        <label htmlFor={inputId} className={`inline-flex min-h-11 cursor-pointer items-center justify-center border border-primary bg-primary px-6 py-3 label-caps text-on-primary transition-opacity hover:opacity-80 ${disabled ? "pointer-events-none opacity-50" : ""}`}>
          {file ? "Choose another image" : "Choose image"}
        </label>
        <input id={inputId} type="file" accept={accept.join(",")} disabled={disabled} className="sr-only" aria-describedby={visibleError ? errorId : undefined} onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ""; }} />
      </div>

      {file ? (
        <>
          <div className="mt-5 grid gap-5 border-t border-outline-variant pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0">
              <p className="truncate body-sm font-medium text-on-background">{file.name}</p>
              <p className="mt-1 body-sm text-on-surface-variant">{dimensions ? `${dimensions.width} × ${dimensions.height}px · ` : ""}{(file.size / 1024 / 1024).toFixed(1)} MB · {compositionReady ? "Preview ready" : "Review composition"}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button type="button" variant="secondary" onClick={() => setEditorOpen(true)} disabled={disabled}>Preview and adjust</Button>
              <Button type="button" variant="text" onClick={clearFile} disabled={disabled}>Remove selection</Button>
            </div>
          </div>

          <fieldset className="mt-5 border-t border-outline-variant pt-5">
            <legend className="label-caps text-on-background">Display style</legend>
            <div className="mt-3 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Image display style">
              {fitOptions.map((option) => {
                const selected = fitMode === option.value;
                return <button key={option.value} type="button" role="radio" aria-checked={selected} disabled={disabled} onClick={() => selectFitMode(option.value)} className={`min-h-24 border p-4 text-left transition-colors ${selected ? "border-primary bg-surface text-on-background" : "border-outline-variant bg-transparent text-on-surface-variant hover:border-outline"}`}><span className="block label-caps">{option.label}</span><span className="mt-2 block body-sm normal-case">{option.description}</span></button>;
              })}
            </div>
            {fitMode === "STRETCH" ? <p role="note" className="mt-3 border-l-2 border-error bg-error-container/20 px-4 py-3 body-sm text-error">Stretch can make products look wider or taller than they really are. Use it only when distortion is intentional.</p> : null}
          </fieldset>

          <figure className="mt-5 border-t border-outline-variant pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <figcaption className="label-caps text-on-background">Live storefront preview</figcaption>
              <span aria-live="polite" className="body-sm text-on-surface-variant">{selectedFitOption.label}</span>
            </div>
            <div className="relative mx-auto mt-3 w-full max-w-sm overflow-hidden border border-outline-variant bg-[#F7F7F5]" style={{ aspectRatio: String(aspect) }}>
              {fitMode === "COVER" && crop && dimensions ? (
                <Image
                  src={objectUrl}
                  alt={alt.trim() || "Selected image storefront preview"}
                  width={dimensions.width}
                  height={dimensions.height}
                  unoptimized
                  className="absolute max-w-none"
                  style={{
                    width: `${10000 / crop.width}%`,
                    height: `${10000 / crop.height}%`,
                    left: `${(-crop.x / crop.width) * 100}%`,
                    top: `${(-crop.y / crop.height) * 100}%`,
                  }}
                />
              ) : (
                <Image src={objectUrl} alt={alt.trim() || "Selected image storefront preview"} fill unoptimized className={fitMode === "STRETCH" ? "object-fill" : fitMode === "COVER" ? "object-cover" : "object-contain"} />
              )}
            </div>
            <p className="mx-auto mt-3 max-w-sm body-sm text-on-surface-variant">
              {fitMode === "COVER" ? (crop ? "This composition will be used after upload. Choose Preview and adjust to reposition or zoom." : "Open Preview and adjust to choose the exact crop before upload.") : selectedFitOption.description}
            </p>
          </figure>
        </>
      ) : null}

      <label htmlFor={altId} className={`mt-5 block label-caps ${visibleError ? "text-error" : "text-on-background"}`}>Alt text</label>
      <p className={`mt-2 body-sm ${visibleError ? "text-error" : "text-on-surface-variant"}`}>Describe the visible product or collection for customers using screen readers.</p>
      <input id={altId} value={alt} onChange={(event) => onAltChange(event.target.value)} maxLength={300} aria-invalid={Boolean(visibleError)} aria-describedby={visibleError ? errorId : undefined} className={`mt-2 w-full border-b bg-transparent py-2 body-sm text-on-background outline-none ${visibleError ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"}`} />
      {visibleError ? <p id={errorId} role="alert" className="mt-2 body-sm text-error">{visibleError}</p> : null}

      <Dialog isOpen={editorOpen && Boolean(objectUrl)} onClose={() => setEditorOpen(false)} title="Preview storefront image" className="max-w-4xl">
        <p className="body-sm text-on-surface-variant">This {frameLabel} frame matches the saved storefront style. {fitMode === "COVER" ? "Drag to position the image and use the slider or pinch gesture to zoom." : "Change the display style above if you want a different composition."}</p>
        <div className="relative mx-auto mt-4 w-full max-w-2xl overflow-hidden border border-outline-variant bg-[#F7F7F5]" style={{ aspectRatio: String(aspect) }}>
          {objectUrl && fitMode === "COVER" ? (
            <Cropper image={objectUrl} crop={position} zoom={zoom} aspect={aspect} objectFit="cover" showGrid onCropChange={setPosition} onZoomChange={setZoom} onCropComplete={(area, pixels) => { setPixelCrop(pixels); onCropChange({ x: area.x, y: area.y, width: area.width, height: area.height }); }} />
          ) : objectUrl ? (
            <Image src={objectUrl} alt="Selected image storefront preview" fill unoptimized className={fitMode === "STRETCH" ? "object-fill" : "object-contain"} />
          ) : null}
        </div>
        {fitMode === "COVER" ? <><label className="mt-5 block label-caps" htmlFor={`${id}-zoom`}>Zoom</label><div className="mt-2 flex items-center gap-4"><button type="button" className="size-11 border border-outline-variant body-md" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.1).toFixed(2))))}>−</button><input id={`${id}-zoom`} type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-primary" /><button type="button" className="size-11 border border-outline-variant body-md" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(3, Number((value + 0.1).toFixed(2))))}>+</button></div></> : null}
        <div className={`mt-4 border-l-2 px-4 py-3 body-sm ${resolutionWarning ? "border-error bg-error-container/20 text-error" : "border-primary bg-surface-container-low text-on-surface-variant"}`}>
          {selectedWidth && selectedHeight ? `Displayed source area: ${selectedWidth} × ${selectedHeight}px. ` : ""}Recommended minimum: {recommendedWidth} × {recommendedHeight}px.{resolutionWarning ? " Choose a larger source or zoom out for a sharper storefront image." : ""}
        </div>
        <div className="mt-5 flex justify-end gap-4">{fitMode === "COVER" ? <Button type="button" variant="secondary" onClick={() => { setPosition({ x: 0, y: 0 }); setZoom(1); }}>Reset</Button> : null}<Button type="button" onClick={() => setEditorOpen(false)}>Use this style</Button></div>
      </Dialog>
    </section>
  );
}
