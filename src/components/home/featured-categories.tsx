import { CategoryCard } from "@/components/shared/category-card";
import { type CategoryDTO } from "@/modules/catalog/dto";

export interface FeaturedCategoriesProps {
  categories: CategoryDTO[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="border-b border-outline-variant py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 grid gap-5 border-b border-outline-variant pb-7 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <span className="mb-3 block font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Curated collections
            </span>
            <h2 className="max-w-[14ch] font-serif text-[clamp(2.25rem,4vw,4rem)] leading-[0.95] tracking-[-0.035em] text-on-background">
              Find the piece that feels like yours.
            </h2>
          </div>
          <p className="max-w-md font-sans text-sm leading-6 text-on-surface-variant lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            Explore small collections of bags and objects, each shaped around a
            distinct material, mood, and making process.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {categories.slice(0, 4).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
