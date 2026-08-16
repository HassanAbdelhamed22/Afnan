import { Suspense } from "react";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { getProductBySlug, getCategoryNavigation, getPublicProductSlugs } from "@/modules/catalog/queries";
import { ProductDetails } from "@/components/catalog/product-details";
import { RelatedProducts } from "@/components/catalog/related-products";
import { RelatedProductsSkeleton } from "@/components/catalog/catalog-loading";
import { ProductStructuredData } from "@/components/catalog/product-structured-data";
import { env } from "@/lib/env";
import { NotFoundError } from "@/lib/errors/app-error";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      title: `${product.name} — Afnan`,
      description: product.description.substring(0, 160),
      alternates: {
        canonical: `${appUrl}/product/${product.slug}`,
      },
      openGraph: {
        title: product.name,
        description: product.description.substring(0, 160),
        url: `${appUrl}/product/${product.slug}`,
        siteName: "Afnan",
        images: product.images.map((img) => ({
          url: img.url,
          width: img.width || 800,
          height: img.height || 1000,
          alt: product.name,
        })),
        type: "website",
      },
    };
  } catch {
    return {
      title: "Piece Not Found — Afnan",
    };
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await getPublicProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Preserve on-demand rendering when MongoDB is unavailable during a build.
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const categories = await getCategoryNavigation();

  const category = categories.find((cat) => cat.id === product.categoryId);

  return (
    <>
      <ProductStructuredData
        product={product}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />
      <ProductDetails
        product={product}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts productId={product.id} categoryId={product.categoryId} />
      </Suspense>
    </>
  );
}
