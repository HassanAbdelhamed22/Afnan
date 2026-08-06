import Link from "next/link";
import Image from "next/image";
import { type ProductCardDTO } from "@/modules/catalog/dto";
import { formatEGP } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export interface ProductCardProps {
  product: ProductCardDTO;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const mainImage = product.images?.[0];
  const isOutOfStock = product.fulfillmentType === "READY_MADE" && !product.inStock;

  return (
    <article className="w-full min-w-0">
      <Link href={`/product/${product.slug}`} className="group block text-on-background no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
      <div className="relative flex aspect-4/5 w-full items-center justify-center overflow-hidden border border-outline-variant bg-[#F7F7F5] transition-colors duration-300 ease-expo-out group-hover:border-primary">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-expo-out group-hover:scale-[1.035]"
          />
        ) : (
          <ImagePlaceholder aspectRatio="4-5" text="No image" className="border-0 bg-transparent" />
        )}

        <div className="absolute left-2 top-2 z-20 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {product.fulfillmentType === "MADE_TO_ORDER" && (
            <Badge variant="outline" className="bg-background px-2 py-0.5 font-sans text-[0.55rem] font-bold uppercase tracking-[0.12em]">
              Made to order
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="primary" className="border-error bg-error px-2 py-0.5 font-sans text-[0.55rem] font-bold uppercase tracking-[0.12em] text-on-error">
              Out of stock
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col pt-3 sm:pt-4">
        {product.categoryName && (
          <span className="mb-1 font-sans text-[0.55rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant sm:text-[0.625rem]">
            {product.categoryName}
          </span>
        )}

        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3 className="font-serif text-base leading-tight text-on-background decoration-1 group-hover:underline group-hover:underline-offset-4 sm:text-lg">
            {product.name}
          </h3>

          <span className="whitespace-nowrap font-sans text-xs font-semibold text-on-background sm:pt-1 sm:text-sm">
            {formatEGP(product.basePriceAmount)}
          </span>
        </div>

        {product.fulfillmentType === "MADE_TO_ORDER" && product.preparationDaysMin && (
          <span className="mt-1 font-sans text-[0.6875rem] leading-4 text-on-surface-variant sm:text-xs">
            Preparation: {product.preparationDaysMin}-{product.preparationDaysMax} days
          </span>
        )}
      </div>
      </Link>
    </article>
  );
}
