import React from "react";
import { type ProductDetailDTO } from "@/modules/catalog/dto";
import { env } from "@/lib/env";

interface ProductStructuredDataProps {
  product: ProductDetailDTO;
  categoryName?: string;
  categorySlug?: string;
}

export function ProductStructuredData({
  product,
  categoryName,
  categorySlug,
}: ProductStructuredDataProps) {
  const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const productUrl = `${appUrl}/product/${product.slug}`;

  // 1. Breadcrumbs Structured Data
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": appUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryName || "Shop",
        "item": categorySlug ? `${appUrl}/category/${categorySlug}` : `${appUrl}/shop`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": productUrl,
      },
    ],
  };

  // 2. Product Structured Data
  const inStock =
    product.fulfillmentType === "MADE_TO_ORDER" ||
    product.variants.some((v) => v.isActive && (v.stockQuantity ?? 0) > 0);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((img) => img.url),
    "description": product.description,
    "sku": product.variants[0]?.sku || product.slug,
    "brand": {
      "@type": "Brand",
      "name": "Afnan",
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "EGP",
      "price": (product.basePriceAmount / 100).toFixed(2), // Convert integer minor units to standard decimal
      "priceValidUntil": "2028-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "EG",
        },
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </>
  );
}
