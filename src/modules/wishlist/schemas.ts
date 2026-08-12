import { z } from "zod";

export const wishlistProductSchema = z.object({
  productId: z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid product"),
});
