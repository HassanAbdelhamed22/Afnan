import "server-only";

import { applyCloudinaryCrop, resolveImageFitMode, type ImageCrop, type ImageFitMode } from "./presentation";

export interface MediaAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: "jpg" | "jpeg" | "png" | "webp";
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  enhancedUrl?: string;
  presentation?: {
    source: "ORIGINAL" | "ENHANCED";
    backgroundRemovalRequested: boolean;
    backgroundRemovalStatus: "NOT_REQUESTED" | "PROCESSING" | "READY" | "FAILED";
    enhancedApproved: boolean;
    backgroundColor: "#F7F7F5";
    aspectRatio: "4:5" | "1:1";
    fitMode?: ImageFitMode;
    crop?: ImageCrop;
  };
}

export function resolveMediaUrl(asset: MediaAsset): string {
  const source = asset.presentation?.source === "ENHANCED" && asset.presentation.enhancedApproved && asset.presentation.backgroundRemovalStatus === "READY" && asset.enhancedUrl
    ? asset.enhancedUrl
    : asset.url;
  return resolveImageFitMode(asset.presentation) === "COVER"
    ? applyCloudinaryCrop(source, asset.width, asset.height, asset.presentation?.crop)
    : source;
}
