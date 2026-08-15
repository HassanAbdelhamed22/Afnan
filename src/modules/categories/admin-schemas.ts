import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const slugSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const categoryAdminInputSchema = z.object({
  id: objectIdSchema.optional(),
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.string().trim().max(1000).optional(),
  sortOrder: z.number().int().min(0).max(10000),
  isActive: z.boolean(),
});

export const categoryAdminFiltersSchema = z.object({
  search: z.string().trim().max(100).default(""),
  state: z.enum(["ALL", "ACTIVE", "ARCHIVED"]).default("ALL"),
  sort: z.enum(["order", "name", "newest"]).default("order"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const categoryStatusInputSchema = z.object({ categoryId: objectIdSchema, isActive: z.boolean() });

export type CategoryAdminInput = z.infer<typeof categoryAdminInputSchema>;
export type CategoryAdminFilters = z.infer<typeof categoryAdminFiltersSchema>;
