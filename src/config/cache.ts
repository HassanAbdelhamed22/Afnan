// Typed cache tags according to AGENTS.md
export const CACHE_TAGS = {
  home: "home",
  products: "products",
  categories: "categories",
  shippingRates: "shipping-rates",
  storeSettings: "store-settings",
  product: (id: string) => `product:${id}`,
  category: (id: string) => `category:${id}`,
} as const;
