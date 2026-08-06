import React from "react";
import { notFound } from "next/navigation";
import {
  listCatalogProducts,
  getCategoryBySlug,
  getCategoryNavigation,
  getAvailableFilterMetadata,
} from "@/modules/catalog/queries";
import { ShopCatalog } from "@/components/catalog/shop-catalog";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const pParams = await searchParams;

  // Verify category exists and is active
  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  // Map and parse URL parameters
  const page = pParams.page ? Math.max(1, parseInt(pParams.page, 10)) : 1;
  const minPrice = pParams.minPrice ? Math.round(parseFloat(pParams.minPrice) * 100) : undefined;
  const maxPrice = pParams.maxPrice ? Math.round(parseFloat(pParams.maxPrice) * 100) : undefined;

  const filters = {
    categorySlug: slug,
    sort: (pParams.sort === "price_asc" || pParams.sort === "price_desc" || pParams.sort === "newest")
      ? pParams.sort as "newest" | "price_asc" | "price_desc"
      : undefined,
    material: pParams.material || undefined,
    color: pParams.color || undefined,
    fulfillmentType: (pParams.fulfillment === "READY_MADE" || pParams.fulfillment === "MADE_TO_ORDER")
      ? pParams.fulfillment as "READY_MADE" | "MADE_TO_ORDER"
      : undefined,
    availability: pParams.availability === "IN_STOCK" ? "IN_STOCK" as const : undefined,
    search: pParams.search || undefined,
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
      activeCategorySlug={slug}
      categoryName={category.name}
    />
  );
}
