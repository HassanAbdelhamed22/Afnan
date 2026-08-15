import "server-only";

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
    aspectRatio: "4:5";
  };
}

export function resolveMediaUrl(asset: MediaAsset): string {
  return asset.presentation?.source === "ENHANCED" && asset.presentation.enhancedApproved && asset.presentation.backgroundRemovalStatus === "READY" && asset.enhancedUrl
    ? asset.enhancedUrl
    : asset.url;
}
