import "server-only";

import { z } from "zod";

export const catalogFiltersSchema = z.object({
  categorySlug: z.string().optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  material: z.string().trim().optional(),
  color: z.string().trim().optional(),
  availability: z.enum(["IN_STOCK", "ALL"]).optional(),
  fulfillmentType: z.enum(["READY_MADE", "MADE_TO_ORDER"]).optional(),
  search: z
    .string()
    .trim()
    .transform((val) => val.replace(/[$]/g, "")) // Escape/strip Mongo operators
    .optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});
