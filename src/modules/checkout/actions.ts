"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireVerifiedUser } from "@/modules/auth/dal";
import type { PlaceOrderResultDTO } from "./dto";
import { placeOrderSchema } from "./schemas";
import { createOrderFromCart } from "./service";

export async function placeOrderAction(input: unknown): Promise<ActionResult<PlaceOrderResultDTO>> {
  const session = await requireVerifiedUser();
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Check your delivery selection", getZodFieldErrors(parsed.error));
  try {
    const orderNumber = await createOrderFromCart({
      id: session.user.id, name: session.user.name, email: session.user.email,
      phoneE164: session.user.phoneE164, whatsappE164: session.user.whatsappE164,
    }, parsed.data);
    revalidatePath("/cart");
    revalidatePath("/account/orders");
    return actionSuccess({ orderNumber }, "Order placed successfully");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "The order could not be placed");
  }
}
