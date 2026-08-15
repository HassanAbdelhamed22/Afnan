import type { MediaAsset } from "@/modules/uploads/types";

export function buildAttachedCategoryImage(asset: MediaAsset, alt: string): MediaAsset {
  return {
    url: asset.url,
    publicId: asset.publicId,
    width: asset.width,
    height: asset.height,
    bytes: asset.bytes,
    format: asset.format,
    alt,
    sortOrder: 0,
    isPrimary: true,
  };
}
