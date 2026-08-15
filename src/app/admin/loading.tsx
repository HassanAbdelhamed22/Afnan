import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading admin content" className="space-y-6">
      <Skeleton className="h-5 max-w-40" />
      <Skeleton className="h-14 max-w-xl" />
      <Skeleton className="h-20" />
      <Skeleton className="h-80" />
    </div>
  );
}
