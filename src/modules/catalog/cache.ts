import "server-only";

export const CACHE_TAGS = {
  home: "home",
  products: "products",
  product: (idOrSlug: string) => `product:${idOrSlug}`,
  categories: "categories",
  category: (idOrSlug: string) => `category:${idOrSlug}`,
  shippingRates: "shipping-rates",
  storeSettings: "store-settings",
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof Omit<typeof CACHE_TAGS, "product" | "category">]
  | ReturnType<typeof CACHE_TAGS.product>
  | ReturnType<typeof CACHE_TAGS.category>;
