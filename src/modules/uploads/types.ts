import "server-only";

export interface MediaAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}
