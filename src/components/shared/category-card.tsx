import Link from "next/link";
import Image from "next/image";
import { type CategoryDTO } from "@/modules/catalog/dto";

export interface CategoryCardProps {
  category: CategoryDTO;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const mainImage = category.image;

  return (
    <article className="w-full min-w-0">
      <Link href={`/category/${category.slug}`} className="group block text-on-background no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
      <div className="relative flex aspect-4/5 w-full items-center justify-center overflow-hidden border border-outline-variant bg-surface transition-colors duration-300 ease-expo-out group-hover:border-primary sm:aspect-square">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform ease-expo-out duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#eee8de] text-on-background">
            <span aria-hidden="true" className="font-serif text-8xl leading-none text-primary/12">
              {category.name.charAt(0)}
            </span>
            <span className="mt-3 font-sans text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              Handmade collection
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 ease-expo-out group-hover:bg-primary/5" />
      </div>

      <div className="flex flex-col pt-4">
        <h3 className="font-serif text-2xl font-normal leading-none text-on-background decoration-1 group-hover:underline group-hover:underline-offset-4">
          {category.name}
        </h3>

        {category.description && (
          <p className="font-sans text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        )}

        <span className="mt-4 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.15em] text-primary">
          Browse collection <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
      </Link>
    </article>
  );
}
