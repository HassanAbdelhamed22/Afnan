import { Skeleton } from "@/components/ui/skeleton";

export default function AddressesLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <Skeleton className="h-12 w-80" />
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  );
}
