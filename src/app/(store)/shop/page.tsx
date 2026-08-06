import React from "react";
import { listCatalogProducts, getCategoryNavigation, getAvailableFilterMetadata } from "@/modules/catalog/queries";
import { ShopCatalog } from "@/components/catalog/shop-catalog";

interface ShopPageProps {
  searchParams: Promise<{
    sort?: string;
    material?: string;
    color?: string;
    fulfillment?: string;
    availability?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  // Map and parse URL parameters
  const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1;
  const minPrice = params.minPrice ? Math.round(parseFloat(params.minPrice) * 100) : undefined;
  const maxPrice = params.maxPrice ? Math.round(parseFloat(params.maxPrice) * 100) : undefined;

  const filters = {
    sort: (params.sort === "price_asc" || params.sort === "price_desc" || params.sort === "newest")
      ? params.sort as "newest" | "price_asc" | "price_desc"
      : undefined,
    material: params.material || undefined,
    color: params.color || undefined,
    fulfillmentType: (params.fulfillment === "READY_MADE" || params.fulfillment === "MADE_TO_ORDER")
      ? params.fulfillment as "READY_MADE" | "MADE_TO_ORDER"
      : undefined,
    availability: params.availability === "IN_STOCK" ? "IN_STOCK" as const : undefined,
    search: params.search || undefined,
    minPrice,
    maxPrice,
    page,
    limit: 12,
  };

  // Fetch data in parallel
  const [catalogData, categories, filterMetadata] = await Promise.all([
    listCatalogProducts(filters),
    getCategoryNavigation(),
    getAvailableFilterMetadata(),
  ]);

  return (
    <ShopCatalog
      products={catalogData.products}
      categories={categories}
      materials={filterMetadata.materials}
      colors={filterMetadata.colors}
      total={catalogData.total}
      currentPage={catalogData.page}
      totalPages={catalogData.totalPages}
    />
  );
}
