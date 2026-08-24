import type { MediaAsset } from "@/modules/uploads/types";
import type { ImageCrop, ImageFitMode } from "@/modules/uploads/presentation";

export function buildAttachedCategoryImage(asset: MediaAsset, alt: string, fitMode: ImageFitMode = "COVER", crop?: ImageCrop): MediaAsset {
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
    presentation: {
      source: "ORIGINAL",
      backgroundRemovalRequested: false,
      backgroundRemovalStatus: "NOT_REQUESTED",
      enhancedApproved: false,
      backgroundColor: "#F7F7F5",
      aspectRatio: "1:1",
      fitMode,
      crop: fitMode === "COVER" ? crop : undefined,
    },
  };
}
