import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const slugSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

function optionalInteger(minimum = 0) {
  return z.number().int().min(minimum).optional();
}

export const productVariantInputSchema = z.object({
  id: objectIdSchema.optional(),
  sku: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  label: z.string().trim().min(1).max(120),
  optionValues: z.record(z.string().trim().min(1).max(40), z.string().trim().min(1).max(80)),
  priceAmount: optionalInteger(),
  stockQuantity: optionalInteger(),
  isActive: z.boolean(),
});

export const productAdminInputSchema = z.object({
  id: objectIdSchema.optional(),
  name: z.string().trim().min(2).max(160),
  slug: slugSchema,
  description: z.string().trim().min(20).max(5000),
  categoryId: objectIdSchema,
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  fulfillmentType: z.enum(["READY_MADE", "MADE_TO_ORDER"]),
  basePriceAmount: z.number().int().min(0),
  materials: z.array(z.string().trim().min(1).max(80)).max(20),
  colors: z.array(z.string().trim().min(1).max(80)).max(20),
  tags: z.array(z.string().trim().min(1).max(80)).max(30),
  dimensions: z.object({
    width: optionalInteger(1),
    height: optionalInteger(1),
    depth: optionalInteger(1),
    unit: z.literal("cm"),
  }).optional(),
  personalizationAvailable: z.boolean(),
  personalizationInstructions: z.string().trim().max(1000).optional(),
  preparationDaysMin: optionalInteger(1),
  preparationDaysMax: optionalInteger(1),
  careInstructions: z.string().trim().max(2000).optional(),
  variants: z.array(productVariantInputSchema).min(1).max(50),
  isFeatured: z.boolean(),
}).superRefine((value, context) => {
  const activeVariants = value.variants.filter((variant) => variant.isActive);
  if (activeVariants.length === 0) {
    context.addIssue({ code: "custom", path: ["variants"], message: "At least one active variant is required" });
  }
  if (new Set(value.variants.map((variant) => variant.sku)).size !== value.variants.length) {
    context.addIssue({ code: "custom", path: ["variants"], message: "Variant SKUs must be unique" });
  }
  if (value.fulfillmentType === "READY_MADE") {
    value.variants.forEach((variant, index) => {
      if (variant.stockQuantity === undefined) {
        context.addIssue({ code: "custom", path: ["variants", index, "stockQuantity"], message: "Ready-made variants require stock" });
      }
    });
  } else {
    if (!value.preparationDaysMin || !value.preparationDaysMax) {
      context.addIssue({ code: "custom", path: ["preparationDaysMin"], message: "Made-to-order products require a preparation range" });
    } else if (value.preparationDaysMin > value.preparationDaysMax) {
      context.addIssue({ code: "custom", path: ["preparationDaysMax"], message: "Maximum preparation days must be greater than or equal to minimum" });
    }
  }
  if (value.personalizationAvailable && !value.personalizationInstructions) {
    context.addIssue({ code: "custom", path: ["personalizationInstructions"], message: "Add personalization instructions" });
  }
});

export const productAdminFiltersSchema = z.object({
  search: z.string().trim().max(100).default(""),
  status: z.enum(["ALL", "DRAFT", "ACTIVE", "ARCHIVED"]).default("ALL"),
  fulfillmentType: z.enum(["ALL", "READY_MADE", "MADE_TO_ORDER"]).default("ALL"),
  categoryId: z.union([z.literal("ALL"), objectIdSchema]).default("ALL"),
  availability: z.enum(["ALL", "IN_STOCK", "OUT_OF_STOCK"]).default("ALL"),
  sort: z.enum(["newest", "name_asc", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const productStatusInputSchema = z.object({
  productId: objectIdSchema,
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
});

export type ProductAdminInput = z.infer<typeof productAdminInputSchema>;
export type ProductAdminFilters = z.infer<typeof productAdminFiltersSchema>;
