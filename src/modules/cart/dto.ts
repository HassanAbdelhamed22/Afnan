import type { CartCatalogIssue } from "@/modules/catalog/commerce";
import type { MediaAsset } from "@/modules/uploads/types";

export interface CartItemDTO {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  sku: string;
  image?: MediaAsset;
  quantity: number;
  personalization?: string;
  unitPriceAmount: number;
  lineTotalAmount: number;
  currency: "EGP";
  fulfillmentType: "READY_MADE" | "MADE_TO_ORDER";
  stockQuantity?: number;
  preparationDaysMin?: number;
  preparationDaysMax?: number;
  available: boolean;
  issue?: CartCatalogIssue | "QUANTITY_EXCEEDS_STOCK";
}

export interface CartDTO {
  items: CartItemDTO[];
  subtotalAmount: number;
  currency: "EGP";
  itemCount: number;
  canCheckout: boolean;
}

export interface CartMutationDTO {
  itemCount: number;
}
