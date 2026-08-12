import { Skeleton } from "@/components/ui/skeleton";
export default function OrdersLoading() { return <main className="mx-auto w-full max-w-6xl px-5 py-12 lg:py-20"><Skeleton className="h-12 w-72" /><div className="mt-10 space-y-5"><Skeleton className="h-48" /><Skeleton className="h-48" /></div></main>; }
