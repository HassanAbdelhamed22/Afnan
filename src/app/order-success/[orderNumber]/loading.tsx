import { Skeleton } from "@/components/ui/skeleton";

export default function OrderSuccessLoading() {
  return (
    <main aria-busy="true" aria-label="Loading order confirmation" className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 lg:py-20">
      <Skeleton className="h-56" />
      <Skeleton className="mt-8 h-80" />
      <div className="mt-8 flex justify-center gap-4">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-40" />
      </div>
    </main>
  );
}
