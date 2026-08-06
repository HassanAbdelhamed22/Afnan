import Link from "next/link";
import { ProductCard } from "@/components/shared/product-card";
import { type ProductCardDTO } from "@/modules/catalog/dto";

export interface NewArrivalsProps {
  products: ProductCardDTO[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-outline-variant py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex items-end justify-between gap-5 border-b border-outline-variant pb-7">
          <div>
            <span className="mb-3 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Fresh from the workshop
            </span>
            <h2 className="font-serif text-[clamp(2.25rem,4vw,4rem)] leading-none tracking-[-0.035em] text-on-background">
              New arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="group hidden items-center gap-3 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-on-background no-underline outline-none hover:opacity-60 focus-visible:ring-2 focus-visible:ring-primary sm:flex"
          >
            View all
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>

        <div className="flex justify-center border-t border-outline-variant pt-8 sm:hidden">
          <Link
            href="/shop?sort=newest"
            className="inline-flex min-h-12 w-full items-center justify-center border border-primary px-7 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-primary no-underline outline-none transition-colors hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary"
          >
            Browse new arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
