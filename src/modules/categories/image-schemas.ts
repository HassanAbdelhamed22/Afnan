import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");

export const attachCategoryImageSchema = z.object({
  categoryId: objectIdSchema,
  intentId: objectIdSchema,
  alt: z.string().trim().min(3).max(300),
});

export const removeCategoryImageSchema = z.object({ categoryId: objectIdSchema });
