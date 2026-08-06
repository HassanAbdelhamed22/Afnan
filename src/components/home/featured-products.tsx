import { ProductCard } from "@/components/shared/product-card";
import { type ProductCardDTO } from "@/modules/catalog/dto";

export interface FeaturedProductsProps {
  products: ProductCardDTO[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-outline-variant bg-surface py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col gap-4 border-b border-outline-variant pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              The atelier edit
            </span>
            <h2 className="font-serif text-[clamp(2.25rem,4vw,4rem)] leading-none tracking-[-0.035em] text-on-background">
              Pieces we love
            </h2>
          </div>
          <span className="font-sans text-xs leading-5 text-on-surface-variant sm:max-w-xs sm:text-right">
            A considered selection of texture, form, and everyday function.
          </span>
        </div>
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
