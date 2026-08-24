import type { MediaAsset } from "@/modules/uploads/types";
import type { ImageCrop, ImageFitMode } from "@/modules/uploads/presentation";

export function buildAttachedProductImage(asset: MediaAsset, alt: string, sortOrder: number, fitMode: ImageFitMode = "CONTAIN", crop?: ImageCrop): MediaAsset {
  return {
    url: asset.url,
    publicId: asset.publicId,
    width: asset.width,
    height: asset.height,
    bytes: asset.bytes,
    format: asset.format,
    alt,
    sortOrder,
    isPrimary: sortOrder === 0,
    presentation: {
      source: "ORIGINAL",
      backgroundRemovalRequested: false,
      backgroundRemovalStatus: "NOT_REQUESTED",
      enhancedApproved: false,
      backgroundColor: "#F7F7F5",
      aspectRatio: "4:5",
      fitMode,
      crop: fitMode === "COVER" ? crop : undefined,
    },
  };
}
