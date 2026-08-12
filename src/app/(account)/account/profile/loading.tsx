import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <Skeleton className="h-12 w-64" />
      <div className="mt-10 border border-outline-variant p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-8 h-10 w-full" />
        <Skeleton className="mt-8 h-10 w-full" />
      </div>
    </main>
  );
}
