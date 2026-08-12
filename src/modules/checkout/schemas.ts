import { z } from "zod";

export const placeOrderSchema = z.object({
  addressId: z.string().trim().regex(/^[a-f\d]{24}$/i, "Select a valid delivery address"),
  checkoutToken: z.string().uuid("Invalid checkout session"),
  paymentMethod: z.literal("CASH_ON_DELIVERY"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
