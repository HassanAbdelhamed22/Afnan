import { getRelatedProducts } from "@/modules/catalog/queries";
import { ProductCard } from "@/components/shared/product-card";

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
}

export async function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const products = await getRelatedProducts(productId, categoryId, 4);

  if (products.length === 0) return null;

  return (
    <section className="border-t border-outline-variant bg-surface py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <h2 className="mb-10 font-serif text-3xl tracking-tight text-on-background">
          Related Pieces
        </h2>
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
