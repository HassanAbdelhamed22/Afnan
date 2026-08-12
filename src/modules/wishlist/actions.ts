"use server";

import { revalidatePath } from "next/cache";

import { AppError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { requireUser } from "@/modules/auth/dal";

import type { WishlistMutationDTO } from "./dto";
import { wishlistProductSchema } from "./schemas";
import { addWishlistItem, removeWishlistItem } from "./service";

function failure(error: unknown): ActionResult<WishlistMutationDTO> {
  if (error instanceof AppError) return actionFailure(error.code, error.message);
  return actionFailure("INTERNAL_ERROR", "The wishlist could not be updated");
}

function success(itemCount: number, productId: string, isSaved: boolean) {
  revalidatePath("/account/wishlist");
  return actionSuccess({ itemCount, productId, isSaved }, isSaved ? "Saved to wishlist" : "Removed from wishlist");
}

export async function addToWishlistAction(input: unknown): Promise<ActionResult<WishlistMutationDTO>> {
  const session = await requireUser();
  const parsed = wishlistProductSchema.safeParse(input);
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid product");
  try {
    const wishlist = await addWishlistItem(session.user.id, parsed.data.productId);
    return success(wishlist.itemCount, parsed.data.productId, true);
  } catch (error) {
    return failure(error);
  }
}

export async function removeFromWishlistAction(input: unknown): Promise<ActionResult<WishlistMutationDTO>> {
  const session = await requireUser();
  const parsed = wishlistProductSchema.safeParse(input);
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Invalid product");
  try {
    const wishlist = await removeWishlistItem(session.user.id, parsed.data.productId);
    return success(wishlist.itemCount, parsed.data.productId, false);
  } catch (error) {
    return failure(error);
  }
}
