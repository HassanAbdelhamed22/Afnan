import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { getProductBySlug, getRelatedProducts, getCategoryNavigation } from "@/modules/catalog/queries";
import { ProductDetails } from "@/components/catalog/product-details";
import { ProductStructuredData } from "@/components/catalog/product-structured-data";
import { env } from "@/lib/env";

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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  // Fetch related products and category name in parallel
  const [relatedProducts, categories] = await Promise.all([
    getRelatedProducts(product.id, 4),
    getCategoryNavigation(),
  ]);

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
        relatedProducts={relatedProducts}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />
    </>
  );
}
