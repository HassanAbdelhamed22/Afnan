import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <Skeleton className="h-12 w-72" />
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="aspect-4/5" />)}
      </div>
    </main>
  );
}
