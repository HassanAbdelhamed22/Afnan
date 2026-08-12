import { Skeleton } from "@/components/ui/skeleton";
export default function CheckoutLoading() { return <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:py-20"><Skeleton className="h-12 w-72" /><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem]"><Skeleton className="h-128" /><Skeleton className="h-96" /></div></main>; }
