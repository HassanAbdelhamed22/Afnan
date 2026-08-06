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
    <div className="group flex flex-col w-full relative">
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {product.name}</span>
      </Link>
      
      {/* Image Container with stable 4:5 ratio and #F7F7F5 background */}
      <div className="relative aspect-4/5 w-full bg-[#F7F7F5] overflow-hidden flex items-center justify-center p-4 border border-outline-variant group-hover:border-primary transition-colors ease-expo-out duration-300">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-contain transition-transform ease-expo-out duration-500 group-hover:scale-105 p-2"
          />
        ) : (
          <ImagePlaceholder aspectRatio="4-5" text="No image" className="border-0 bg-transparent" />
        )}

        {/* Badges container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {product.fulfillmentType === "MADE_TO_ORDER" && (
            <Badge variant="outline" className="text-[10px] py-0.5 px-2 bg-background border-outline-variant font-sans label-caps">
              Custom Order
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="primary" className="text-[10px] py-0.5 px-2 bg-error border-error text-on-error font-sans label-caps">
              Out of stock
            </Badge>
          )}
        </div>
      </div>

      {/* Info Container with editorial style */}
      <div className="flex flex-col pt-4">
        {/* Category name if available */}
        {product.categoryName && (
          <span className="text-[10px] font-sans label-caps text-on-surface-variant mb-1">
            {product.categoryName}
          </span>
        )}

        <div className="flex items-start justify-between gap-4">
          {/* Title - EB Garamond (serif) */}
          <h3 className="font-serif text-lg leading-snug text-on-background group-hover:underline group-hover:underline-offset-4 decoration-1">
            {product.name}
          </h3>

          {/* Price - Manrope (sans-serif) */}
          <span className="font-sans text-sm font-semibold text-on-background whitespace-nowrap pt-1">
            {formatEGP(product.basePriceAmount)}
          </span>
        </div>

        {/* Made-to-order prep time indicator */}
        {product.fulfillmentType === "MADE_TO_ORDER" && product.preparationDaysMin && (
          <span className="text-xs text-on-surface-variant font-sans mt-1">
            Ships in {product.preparationDaysMin}-{product.preparationDaysMax} days
          </span>
        )}
      </div>
    </div>
  );
}
