import "server-only";

import { type MediaAsset } from "../uploads/types";

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: MediaAsset;
  sortOrder: number;
}

export interface PurchasableVariantDTO {
  id: string;
  sku: string;
  label: string;
  optionValues: Record<string, string>;
  priceAmount: number; // resolved variant price
  stockQuantity?: number; // only exposed if READY_MADE fulfillmentType
  isActive: boolean;
}

export interface ProductCardDTO {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  basePriceAmount: number;
  currency: "EGP";
  images: MediaAsset[];
  isFeatured: boolean;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  inStock?: boolean;
}

export interface ProductDetailDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  basePriceAmount: number;
  currency: "EGP";
  materials: string[];
  colors: string[];
  tags: string[];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit: "cm";
  };
  personalizationAvailable: boolean;
  personalizationInstructions?: string;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  careInstructions?: string;
  images: MediaAsset[];
  variants: PurchasableVariantDTO[];
  isFeatured: boolean;
  publishedAt?: string;
}

export interface CatalogFilters {
  categorySlug?: string;
  minPrice?: number; // EGP minor units
  maxPrice?: number; // EGP minor units
  material?: string;
  color?: string;
  availability?: "IN_STOCK" | "ALL";
  fulfillmentType?: "READY_MADE" | "MADE_TO_ORDER";
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "relevance";
  page?: number;
  limit?: number;
}

export interface PaginatedCatalogProducts {
  products: ProductCardDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
