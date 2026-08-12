import "server-only";

import { getWishableProduct, listProductsForWishlist } from "@/modules/catalog/commerce";

import type { WishlistDTO } from "./dto";
import {
  addWishlistItemRecord,
  getWishlistItemsRecord,
  removeWishlistItemRecord,
} from "./repository";

export async function getWishlist(userId: string): Promise<WishlistDTO> {
  const records = await getWishlistItemsRecord(userId);
  const catalogItems = await listProductsForWishlist(
    records.map((record) => record.productId.toString()),
  );
  const items = records.map((record, index) => ({
    productId: record.productId.toString(),
    addedAt: record.addedAt.toISOString(),
    available: Boolean(catalogItems[index]),
    product: catalogItems[index],
  }));
  return {
    items,
    itemCount: items.length,
    productIds: items.map((item) => item.productId),
  };
}

export async function addWishlistItem(userId: string, productId: string): Promise<WishlistDTO> {
  await getWishableProduct(productId);
  await addWishlistItemRecord(userId, productId);
  return getWishlist(userId);
}

export async function removeWishlistItem(userId: string, productId: string): Promise<WishlistDTO> {
  await removeWishlistItemRecord(userId, productId);
  return getWishlist(userId);
}
