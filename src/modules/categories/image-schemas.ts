import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");

export const attachCategoryImageSchema = z.object({
  categoryId: objectIdSchema,
  intentId: objectIdSchema,
  alt: z.string().trim().min(3).max(300),
  fitMode: z.enum(["CONTAIN", "COVER", "STRETCH"]).default("CONTAIN"),
  crop: z.object({
    x: z.number().min(0).max(100), y: z.number().min(0).max(100),
    width: z.number().positive().max(100), height: z.number().positive().max(100),
  }).refine((crop) => crop.x + crop.width <= 100.01 && crop.y + crop.height <= 100.01, "Crop is outside the image").optional(),
}).superRefine((value, context) => {
  if (value.fitMode === "COVER" && !value.crop) context.addIssue({ code: "custom", path: ["crop"], message: "Fill-frame images require a crop" });
});

export const removeCategoryImageSchema = z.object({ categoryId: objectIdSchema });
