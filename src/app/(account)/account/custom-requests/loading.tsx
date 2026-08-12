import { Skeleton } from "@/components/ui/skeleton";
export default function CustomRequestsLoading() { return <main className="mx-auto w-full max-w-6xl px-5 py-12 lg:py-20"><Skeleton className="h-12 w-80" /><div className="mt-10 space-y-5"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></main>; }
