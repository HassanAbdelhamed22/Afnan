"use server";

import { revalidatePath } from "next/cache";

import { AppError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireUser } from "@/modules/auth/dal";

import type { CartMutationDTO } from "./dto";
import { addCartItem, clearCart, removeCartItem, updateCartItem } from "./service";
import { addCartItemSchema, cartItemIdSchema, updateCartItemSchema } from "./schemas";

function mutationSuccess(itemCount: number, message: string): ActionResult<CartMutationDTO> {
  revalidatePath("/cart");
  return actionSuccess({ itemCount }, message);
}

function mutationFailure(error: unknown): ActionResult<CartMutationDTO> {
  if (error instanceof AppError) {
    return actionFailure(error.code, error.message);
  }
  return actionFailure("INTERNAL_ERROR", "The cart could not be updated");
}

export async function addToCartAction(input: unknown): Promise<ActionResult<CartMutationDTO>> {
  const session = await requireUser();
  const parsed = addCartItemSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Select a valid product option and quantity",
      getZodFieldErrors(parsed.error),
    );
  }
  try {
    const cart = await addCartItem(session.user.id, parsed.data);
    return mutationSuccess(cart.itemCount, "Added to cart");
  } catch (error) {
    return mutationFailure(error);
  }
}

export async function updateCartItemAction(input: unknown): Promise<ActionResult<CartMutationDTO>> {
  const session = await requireUser();
  const parsed = updateCartItemSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure("VALIDATION_ERROR", "Enter a valid quantity", getZodFieldErrors(parsed.error));
  }
  try {
    const cart = await updateCartItem(session.user.id, parsed.data);
    return mutationSuccess(cart.itemCount, "Cart updated");
  } catch (error) {
    return mutationFailure(error);
  }
}

export async function removeCartItemAction(input: unknown): Promise<ActionResult<CartMutationDTO>> {
  const session = await requireUser();
  const parsed = cartItemIdSchema.safeParse(input);
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid cart item");
  try {
    const cart = await removeCartItem(session.user.id, parsed.data.itemId);
    return mutationSuccess(cart.itemCount, "Item removed");
  } catch (error) {
    return mutationFailure(error);
  }
}

export async function clearCartAction(): Promise<ActionResult<CartMutationDTO>> {
  const session = await requireUser();
  try {
    const cart = await clearCart(session.user.id);
    return mutationSuccess(cart.itemCount, "Cart cleared");
  } catch (error) {
    return mutationFailure(error);
  }
}
