import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const cropSchema = z.object({
  x: z.number().min(0).max(100), y: z.number().min(0).max(100),
  width: z.number().positive().max(100), height: z.number().positive().max(100),
}).refine((crop) => crop.x + crop.width <= 100.01 && crop.y + crop.height <= 100.01, "Crop is outside the image");
export const attachProductImageSchema = z.object({ productId: objectId, intentId: objectId, alt: z.string().trim().min(3).max(300), fitMode: z.enum(["CONTAIN", "COVER", "STRETCH"]).default("CONTAIN"), crop: cropSchema.optional() }).superRefine((value, context) => {
  if (value.fitMode === "COVER" && !value.crop) context.addIssue({ code: "custom", path: ["crop"], message: "Fill-frame images require a crop" });
});
export const productImageTargetSchema = z.object({ productId: objectId, publicId: z.string().trim().min(1).max(300) });
export const orderProductImageSchema = productImageTargetSchema.extend({ direction: z.enum(["UP", "DOWN", "PRIMARY"]) });
export const approveProductImageSchema = productImageTargetSchema.extend({ source: z.enum(["ORIGINAL", "ENHANCED"]) });
