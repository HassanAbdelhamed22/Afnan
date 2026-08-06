"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type ProductCardDTO, type CategoryDTO } from "@/modules/catalog/dto";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface ShopCatalogProps {
  products: ProductCardDTO[];
  categories: CategoryDTO[];
  materials: string[];
  colors: string[];
  total: number;
  currentPage: number;
  totalPages: number;
  activeCategorySlug?: string;
  categoryName?: string;
}

export function ShopCatalog({
  products,
  categories,
  materials,
  colors,
  total,
  currentPage,
  totalPages,
  activeCategorySlug,
  categoryName,
}: ShopCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  // Read current filter state from URL
  const activeSort = searchParams.get("sort") || "newest";
  const activeMaterial = searchParams.get("material") || "";
  const activeColor = searchParams.get("color") || "";
  const activeFulfillment = searchParams.get("fulfillment") || "";
  const activeAvailability = searchParams.get("availability") || "";
  const activeSearch = searchParams.get("search") || "";

  // Local refs for prices (to avoid layout updates while typing and Eslint cascading triggers)
  const minPriceRef = React.useRef<HTMLInputElement>(null);
  const maxPriceRef = React.useRef<HTMLInputElement>(null);

  // Helper to update query string parameters
  const updateQuery = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Always reset page to 1 when a filter is modified (except sorting/page updates themselves)
      let resetPage = true;

      Object.entries(updates).forEach(([key, value]) => {
        if (key === "page" || key === "sort") {
          resetPage = false;
        }
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (resetPage) {
        params.delete("page");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handlePriceApply = React.useCallback(() => {
    updateQuery({
      minPrice: minPriceRef.current?.value || null,
      maxPrice: maxPriceRef.current?.value || null,
    });
  }, [updateQuery]);

  const handleClearAll = React.useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const activeChips = React.useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];
    
    if (activeSearch) {
      chips.push({
        label: `Search: "${activeSearch}"`,
        onRemove: () => updateQuery({ search: null }),
      });
    }
    if (activeMaterial) {
      chips.push({
        label: `Material: ${activeMaterial}`,
        onRemove: () => updateQuery({ material: null }),
      });
    }
    if (activeColor) {
      chips.push({
        label: `Color: ${activeColor}`,
        onRemove: () => updateQuery({ color: null }),
      });
    }
    if (activeFulfillment) {
      chips.push({
        label: activeFulfillment === "READY_MADE" ? "Ready-made" : "Made-to-order",
        onRemove: () => updateQuery({ fulfillment: null }),
      });
    }
    if (activeAvailability === "IN_STOCK") {
      chips.push({
        label: "In Stock Only",
        onRemove: () => updateQuery({ availability: null }),
      });
    }
    if (searchParams.get("minPrice")) {
      chips.push({
        label: `Min EGP ${searchParams.get("minPrice")}`,
        onRemove: () => {
          updateQuery({ minPrice: null });
        },
      });
    }
    if (searchParams.get("maxPrice")) {
      chips.push({
        label: `Max EGP ${searchParams.get("maxPrice")}`,
        onRemove: () => {
          updateQuery({ maxPrice: null });
        },
      });
    }

    return chips;
  }, [
    activeSearch,
    activeMaterial,
    activeColor,
    activeFulfillment,
    activeAvailability,
    searchParams,
    updateQuery,
  ]);

  const renderFilterPanel = () => (
    <div className="flex flex-col gap-9">
      {/* Category List (Only displayed in All Shop view) */}
      {!activeCategorySlug && (
        <div className="border-b border-outline-variant pb-7">
          <h3 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            Collections
          </h3>
          <ul className="flex flex-col gap-3">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/category/${cat.slug}`)}
                  className="font-sans text-sm text-on-surface hover:text-primary transition-colors text-left"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Availability */}
      <div className="border-b border-outline-variant pb-7">
        <h3 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
          Availability
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={activeAvailability === "IN_STOCK"}
            onChange={(e) =>
              updateQuery({ availability: e.target.checked ? "IN_STOCK" : null })
            }
            className="size-4 rounded-none border border-outline-variant bg-transparent text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
          />
          <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
            In stock only
          </span>
        </label>
      </div>

      {/* Fulfillment Type */}
      <div className="border-b border-outline-variant pb-7">
        <h3 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
          Making Style
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: "Ready-made", value: "READY_MADE" },
            { label: "Made-to-order", value: "MADE_TO_ORDER" },
          ].map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={activeFulfillment === type.value}
                onChange={(e) =>
                  updateQuery({ fulfillment: e.target.checked ? type.value : null })
                }
                className="size-4 rounded-none border border-outline-variant bg-transparent text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
              />
              <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b border-outline-variant pb-7">
        <h3 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
          Price Range (EGP)
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="block font-sans text-[0.625rem] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Min
              </span>
              <input
                ref={minPriceRef}
                key={`min-${searchParams.get("minPrice") || ""}`}
                type="number"
                defaultValue={searchParams.get("minPrice") || ""}
                placeholder="0"
                className="w-full border-b border-outline-variant bg-transparent py-1.5 text-sm text-on-background focus:border-primary outline-none transition-colors"
              />
            </div>
            <span className="text-on-surface-variant self-end pb-1.5">—</span>
            <div className="flex-1">
              <span className="block font-sans text-[0.625rem] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Max
              </span>
              <input
                ref={maxPriceRef}
                key={`max-${searchParams.get("maxPrice") || ""}`}
                type="number"
                defaultValue={searchParams.get("maxPrice") || ""}
                placeholder="Any"
                className="w-full border-b border-outline-variant bg-transparent py-1.5 text-sm text-on-background focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handlePriceApply}
            className="w-full py-2.5 text-[0.625rem] tracking-wider"
          >
            Apply Price
          </Button>
        </div>
      </div>

      {/* Materials */}
      {materials.length > 0 && (
        <div className="border-b border-outline-variant pb-7">
          <h3 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            Materials
          </h3>
          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2">
            {materials.map((material) => (
              <label key={material} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activeMaterial === material}
                  onChange={(e) =>
                    updateQuery({ material: e.target.checked ? material : null })
                  }
                  className="size-4 rounded-none border border-outline-variant bg-transparent text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
                />
                <span className="font-sans text-sm text-on-surface group-hover:text-primary transition-colors">
                  {material}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            Colors
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = activeColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateQuery({ color: isSelected ? null : color })}
                  className={cn(
                    "border border-solid border-outline-variant px-3 py-1.5 font-sans text-xs uppercase tracking-wider transition-colors",
                    isSelected
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-transparent text-on-surface hover:bg-surface-container-low"
                  )}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Header Cover Title Banner */}
      <header className="border-b border-outline-variant bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
          {activeCategorySlug ? (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Collection
              </span>
              <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[-0.035em] text-on-background">
                {categoryName}
              </h1>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Atelier
              </span>
              <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[-0.035em] text-on-background">
                Browse Shop
              </h1>
            </div>
          )}
        </div>
      </header>

      {/* Main Catalog View Grid */}
      <main className="mx-auto max-w-[100rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Desktop Left Sidebar Filter Controls */}
          <aside className="hidden lg:col-span-3 lg:block pr-6 border-r border-outline-variant">
            {renderFilterPanel()}
          </aside>

          {/* Catalog Right Side List Panel */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {/* Top Toolbar: Results count, filter triggers & sort controls */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-5 flex-wrap gap-4">
              <span className="font-sans text-xs tracking-wider text-on-surface-variant font-medium">
                {total === 1 ? "1 piece found" : `${total} pieces found`}
              </span>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle Button */}
                <Button
                  variant="secondary"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="lg:hidden py-2.5 px-4 text-xs font-sans font-bold uppercase tracking-wider"
                >
                  Filters
                </Button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 border-b border-outline-variant pr-2">
                  <span className="font-sans text-[0.625rem] font-bold uppercase tracking-wider text-on-surface-variant">
                    Sort
                  </span>
                  <select
                    value={activeSort}
                    onChange={(e) => updateQuery({ sort: e.target.value })}
                    className="border-none bg-transparent py-1 font-sans text-xs text-on-background outline-none cursor-pointer focus:ring-0 focus-visible:ring-0 pr-4"
                  >
                    <option value="newest">New arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active filters chips bar */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant pb-6">
                <span className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-on-surface-variant mr-1">
                  Active Filters:
                </span>
                {activeChips.map((chip, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 border border-solid border-outline-variant bg-surface px-3 py-1 font-sans text-xs tracking-wide text-on-surface"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="text-on-surface-variant hover:text-primary outline-none focus-visible:text-primary transition-colors text-sm font-light leading-none"
                      aria-label="Remove filter"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-primary underline underline-offset-4 hover:opacity-60 ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Card Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No pieces found"
                description="We couldn't find any products matching your active filter criteria."
                action={
                  <Button variant="primary" onClick={handleClearAll} className="px-6 py-3">
                    Reset all filters
                  </Button>
                }
              />
            )}

            {/* Pagination Selector */}
            {totalPages > 1 && (
              <div className="border-t border-outline-variant pt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => updateQuery({ page: String(page) })}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Refine Pieces"
      >
        <div className="pb-12">
          {renderFilterPanel()}
          <div className="mt-8 flex gap-4 border-t border-outline-variant pt-6">
            <Button
              variant="primary"
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 py-3 text-xs"
            >
              Show Results
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                handleClearAll();
                setIsFilterDrawerOpen(false);
              }}
              className="py-3 text-xs px-4"
            >
              Clear
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
