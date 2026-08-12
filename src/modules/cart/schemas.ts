import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier");

export const addCartItemSchema = z.object({
  productId: objectIdSchema,
  variantId: objectIdSchema,
  quantity: z.number().int().min(1).max(99),
  personalization: z.string().max(500).optional(),
});

export const updateCartItemSchema = z.object({
  itemId: objectIdSchema,
  quantity: z.number().int().min(1).max(99),
});

export const cartItemIdSchema = z.object({ itemId: objectIdSchema });

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
