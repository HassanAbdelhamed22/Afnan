import type { ProductCardDTO } from "@/modules/catalog/dto";

export interface WishlistItemDTO {
  productId: string;
  addedAt: string;
  available: boolean;
  product?: ProductCardDTO;
}

export interface WishlistDTO {
  items: WishlistItemDTO[];
  itemCount: number;
  productIds: string[];
}

export interface WishlistMutationDTO {
  itemCount: number;
  productId: string;
  isSaved: boolean;
}
