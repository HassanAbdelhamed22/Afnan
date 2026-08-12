import "server-only";

import { InvalidStateError } from "@/lib/errors/app-error";
import {
  getPurchasableVariant,
  listProductsForCart,
} from "@/modules/catalog/commerce";

import { calculateCartSubtotal, calculateLineTotal, normalizePersonalization } from "./domain";
import type { CartDTO } from "./dto";
import {
  addCartItemRecord,
  clearCartRecord,
  getCartItemsRecord,
  getOwnedCartItemRecord,
  removeCartItemRecord,
  updateCartItemQuantityRecord,
} from "./repository";
import type { AddCartItemInput, UpdateCartItemInput } from "./schemas";

export async function getCart(userId: string): Promise<CartDTO> {
  const records = await getCartItemsRecord(userId);
  const catalogItems = await listProductsForCart(
    records.map((item) => ({
      productId: item.productId.toString(),
      variantId: item.variantId.toString(),
    })),
  );

  const items = records.map((record, index) => {
    const catalog = catalogItems[index];
    const exceedsStock =
      catalog.fulfillmentType === "READY_MADE" &&
      record.quantity > (catalog.stockQuantity ?? 0);
    const available = catalog.available && !exceedsStock;
    return {
      id: record._id.toString(),
      productId: record.productId.toString(),
      variantId: record.variantId.toString(),
      productName: catalog.productName,
      productSlug: catalog.productSlug,
      variantLabel: catalog.variantLabel,
      sku: catalog.sku,
      image: catalog.primaryImage,
      quantity: record.quantity,
      personalization: record.personalization || undefined,
      unitPriceAmount: catalog.priceAmount,
      lineTotalAmount: available
        ? calculateLineTotal(catalog.priceAmount, record.quantity)
        : 0,
      currency: "EGP" as const,
      fulfillmentType: catalog.fulfillmentType,
      stockQuantity: catalog.stockQuantity,
      preparationDaysMin: catalog.preparationDaysMin,
      preparationDaysMax: catalog.preparationDaysMax,
      available,
      issue: exceedsStock ? ("QUANTITY_EXCEEDS_STOCK" as const) : catalog.issue,
    };
  });

  return {
    items,
    subtotalAmount: calculateCartSubtotal(items),
    currency: "EGP",
    itemCount: records.reduce((count, item) => count + item.quantity, 0),
    canCheckout: items.length > 0 && items.every((item) => item.available),
  };
}

export async function addCartItem(userId: string, input: AddCartItemInput): Promise<CartDTO> {
  const variant = await getPurchasableVariant(input.productId, input.variantId);
  const personalization = normalizePersonalization(input.personalization);
  if (personalization && !variant.personalizationAvailable) {
    throw new InvalidStateError("This product does not accept personalization");
  }
  if (
    variant.fulfillmentType === "READY_MADE" &&
    input.quantity > (variant.stockQuantity ?? 0)
  ) {
    throw new InvalidStateError("Requested quantity exceeds current stock");
  }

  await addCartItemRecord({
    userId,
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,
    personalization,
    maximumQuantity:
      variant.fulfillmentType === "READY_MADE" ? variant.stockQuantity : undefined,
  });
  return getCart(userId);
}

export async function updateCartItem(
  userId: string,
  input: UpdateCartItemInput,
): Promise<CartDTO> {
  const record = await getOwnedCartItemRecord(userId, input.itemId);
  const variant = await getPurchasableVariant(
    record.productId.toString(),
    record.variantId.toString(),
  );
  if (
    variant.fulfillmentType === "READY_MADE" &&
    input.quantity > (variant.stockQuantity ?? 0)
  ) {
    throw new InvalidStateError("Requested quantity exceeds current stock");
  }
  await updateCartItemQuantityRecord(userId, input.itemId, input.quantity);
  return getCart(userId);
}

export async function removeCartItem(userId: string, itemId: string): Promise<CartDTO> {
  await removeCartItemRecord(userId, itemId);
  return getCart(userId);
}

export async function clearCart(userId: string): Promise<CartDTO> {
  await clearCartRecord(userId);
  return getCart(userId);
}
