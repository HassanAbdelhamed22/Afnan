import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <Skeleton className="h-12 w-72" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-96" />
        <Skeleton className="h-72" />
      </div>
    </main>
  );
}
