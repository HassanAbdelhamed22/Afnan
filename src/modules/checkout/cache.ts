import "server-only";

import {
  revalidateCategoryCache,
  revalidateProductCache,
} from "@/modules/catalog/queries";

export interface PurchasedProductCacheTarget {
  productId: string;
  productSlug: string;
  categoryId: string;
}

export function invalidatePurchasedProductCaches(
  products: PurchasedProductCacheTarget[],
): void {
  const categories = new Set<string>();

  for (const product of products) {
    revalidateProductCache(product.productId, product.productSlug);
    categories.add(product.categoryId);
  }

  for (const categoryId of categories) {
    revalidateCategoryCache(categoryId);
  }
}
