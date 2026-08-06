import Link from "next/link";
import Image from "next/image";
import { type CategoryDTO } from "@/modules/catalog/dto";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export interface CategoryCardProps {
  category: CategoryDTO;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const mainImage = category.image;

  return (
    <div className="group flex flex-col w-full relative">
      <Link href={`/category/${category.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Browse {category.name}</span>
      </Link>

      {/* Category Image - 1:1 Square Ratio with Surface background and Hairline Border */}
      <div className="relative aspect-square w-full bg-surface border border-outline-variant overflow-hidden flex items-center justify-center p-4 group-hover:border-primary transition-colors ease-expo-out duration-300">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform ease-expo-out duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder aspectRatio="1-1" text="No category image" className="border-0 bg-transparent" />
        )}
        
        {/* Typographic Overlay or Background Tint on Hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/3 transition-colors ease-expo-out duration-300" />
      </div>

      {/* Info Container */}
      <div className="flex flex-col pt-4">
        {/* Title - EB Garamond (serif) */}
        <h3 className="font-serif text-xl font-normal text-on-background group-hover:underline group-hover:underline-offset-4 decoration-1">
          {category.name}
        </h3>

        {/* Description - Manrope (sans-serif) */}
        {category.description && (
          <p className="font-sans text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        )}

        {/* View Collection Link */}
        <span className="text-[10px] font-sans label-caps text-primary underline underline-offset-4 mt-3 block">
          Browse Collection
        </span>
      </div>
    </div>
  );
}
