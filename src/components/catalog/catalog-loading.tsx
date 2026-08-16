import { Skeleton } from "@/components/ui/skeleton";

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="aspect-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function CatalogPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading products" className="mx-auto w-full max-w-[100rem] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 max-w-md" />
        <Skeleton className="h-5 max-w-2xl" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden space-y-6 lg:block">
          <Skeleton className="h-10" />
          <Skeleton className="h-48" />
          <Skeleton className="h-40" />
        </aside>
        <div>
          <div className="mb-8 flex justify-between gap-5">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-44" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </main>
  );
}

export function ProductPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading product" className="mx-auto w-full max-w-[100rem] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <Skeleton className="mb-10 h-4 w-56" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <Skeleton className="aspect-4/5 lg:col-span-6" />
        <div className="space-y-7 lg:col-span-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-14 w-4/5" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-20" />
          <Skeleton className="h-28" />
          <Skeleton className="h-12" />
        </div>
      </div>
    </main>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading related products" className="border-t border-outline-variant bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <Skeleton className="mb-10 h-10 w-64" />
        <ProductGridSkeleton count={4} />
      </div>
    </section>
  );
}
