import { z } from "zod";

export const MAX_CUSTOM_REQUEST_IMAGES = 5;
export const MAX_CUSTOM_REQUEST_IMAGE_BYTES = 5 * 1024 * 1024;
export const CUSTOM_REQUEST_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PRODUCT_IMAGES = 10;
export const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = CUSTOM_REQUEST_IMAGE_TYPES;

export const createUploadIntentSchema = z.object({
  filename: z.string().trim().min(1).max(180),
  mimeType: z.enum(CUSTOM_REQUEST_IMAGE_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_PRODUCT_IMAGE_BYTES),
  purpose: z.enum(["CUSTOM_REQUEST_REFERENCE", "PRODUCT_IMAGE"]).default("CUSTOM_REQUEST_REFERENCE"),
}).superRefine((value, context) => {
  if (value.purpose === "CUSTOM_REQUEST_REFERENCE" && value.sizeBytes > MAX_CUSTOM_REQUEST_IMAGE_BYTES) {
    context.addIssue({ code: "custom", path: ["sizeBytes"], message: "Custom request images must be 5 MB or smaller" });
  }
});

export const completeUploadSchema = z.object({
  intentId: z.string().regex(/^[a-f\d]{24}$/i),
  publicId: z.string().min(1).max(300),
  version: z.number().int().positive(),
  signature: z.string().regex(/^[a-f\d]{40}$/i),
});
