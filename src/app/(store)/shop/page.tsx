import React from "react";
import { type Metadata } from "next";
import { env } from "@/lib/env";
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
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let title = "Handmade Products Atelier — Afnan";
  let description = "Browse our premium curated selection of Egyptian handmade crafts, made-to-order personalized gifts, ready-made accessories, and home decor.";

  const searchQuery = params.search || params.q;
  if (searchQuery) {
    title = `Search results for "${searchQuery}" — Afnan`;
    description = `Browse premium Egyptian handmade products matching search keyword "${searchQuery}".`;
  } else if (params.material) {
    title = `Handmade ${params.material} Pieces — Afnan`;
    description = `Explore our collection of authentic Egyptian handmade products crafted with ${params.material}.`;
  } else if (params.color) {
    title = `Curated ${params.color} Collection — Afnan`;
    description = `Browse premium Egyptian handmade pieces in curated color ${params.color}.`;
  }

  const canonicalUrl = `${appUrl}/shop`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Afnan",
      type: "website",
    },
  };
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
    search: params.search || params.q || undefined,
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
