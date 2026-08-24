export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageFitMode = "CONTAIN" | "COVER" | "STRETCH";

export function resolveImageFitMode(presentation?: { fitMode?: ImageFitMode; crop?: ImageCrop }): ImageFitMode {
  return presentation?.fitMode ?? (presentation?.crop ? "COVER" : "CONTAIN");
}

function boundedPercentage(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function isValidImageCrop(crop: ImageCrop) {
  return boundedPercentage(crop.x)
    && boundedPercentage(crop.y)
    && boundedPercentage(crop.width)
    && boundedPercentage(crop.height)
    && crop.width > 0
    && crop.height > 0
    && crop.x + crop.width <= 100.01
    && crop.y + crop.height <= 100.01;
}

export function applyCloudinaryCrop(url: string, sourceWidth?: number, sourceHeight?: number, crop?: ImageCrop) {
  if (!crop || !sourceWidth || !sourceHeight || !isValidImageCrop(crop)) return url;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com" || !parsed.pathname.includes("/image/upload/")) return url;

    const x = Math.max(0, Math.round(sourceWidth * crop.x / 100));
    const y = Math.max(0, Math.round(sourceHeight * crop.y / 100));
    const width = Math.max(1, Math.min(sourceWidth - x, Math.round(sourceWidth * crop.width / 100)));
    const height = Math.max(1, Math.min(sourceHeight - y, Math.round(sourceHeight * crop.height / 100)));
    parsed.pathname = parsed.pathname.replace("/image/upload/", `/image/upload/c_crop,x_${x},y_${y},w_${width},h_${height}/`);
    return parsed.toString();
  } catch {
    return url;
  }
}
