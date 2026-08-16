import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div aria-busy="true" aria-label="Loading account access" className="w-full space-y-6">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <div className="space-y-5 pt-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  );
}
