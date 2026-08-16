import "server-only";

import { CACHE_TAGS } from "@/config/cache";

export { CACHE_TAGS };

export type CacheTag = typeof CACHE_TAGS[keyof Omit<typeof CACHE_TAGS, "product" | "category">]
  | ReturnType<typeof CACHE_TAGS.product>
  | ReturnType<typeof CACHE_TAGS.category>;
