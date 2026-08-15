import type { MediaAsset } from "@/modules/uploads/types";

export interface AdminVariantDTO {
  id: string;
  sku: string;
  label: string;
  optionValues: Record<string, string>;
  priceAmount?: number;
  stockQuantity?: number;
  isActive: boolean;
}

export interface AdminProductListItemDTO {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  basePriceAmount: number;
  activeVariantCount: number;
  totalStock?: number;
  updatedAt: string;
}

export interface AdminProductDTO extends AdminProductListItemDTO {
  description: string;
  categoryId: string;
  materials: string[];
  colors: string[];
  tags: string[];
  dimensions?: { width?: number; height?: number; depth?: number; unit: "cm" };
  personalizationAvailable: boolean;
  personalizationInstructions?: string;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  careInstructions?: string;
  variants: AdminVariantDTO[];
  isFeatured: boolean;
  imageCount: number;
  images: MediaAsset[];
}

export interface PaginatedAdminProductsDTO {
  products: AdminProductListItemDTO[];
  total: number;
  page: number;
  totalPages: number;
}
