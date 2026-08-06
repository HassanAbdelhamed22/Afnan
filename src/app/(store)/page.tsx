import React from "react";
import {
  getCategoryNavigation,
  getFeaturedProducts,
  listCatalogProducts,
} from "@/modules/catalog";
import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { CraftPhilosophy } from "@/components/home/craft-philosophy";
import { CustomRequestCta } from "@/components/home/custom-request-cta";
import { TrustFaq } from "@/components/home/trust-faq";

export default async function StoreHomePage() {
  // Concurrent data fetching for optimized response times
  const [categories, featuredProducts, newArrivalsData] = await Promise.all([
    getCategoryNavigation(),
    getFeaturedProducts(4),
    listCatalogProducts({ limit: 8, sort: "newest" }),
  ]);

  return (
    <div className="w-full overflow-x-clip bg-background">
      {/* 1. Hero Cover Banner */}
      <Hero />

      <div className="flex flex-col">
        {/* 2. Collections navigation */}
        <FeaturedCategories categories={categories} />

        {/* 3. Editor's selection */}
        <FeaturedProducts products={featuredProducts} />

        {/* 4. Latest additions */}
        <NewArrivals products={newArrivalsData.products} />

        {/* 5. Craft and logistics philosophy */}
        <CraftPhilosophy />

        {/* 6. Custom requests CTA card */}
        <CustomRequestCta />

        {/* 7. Store trust features and FAQ section */}
        <TrustFaq />
      </div>
    </div>
  );
}
