import Link from "next/link";
import { getCustomerCustomRequests } from "@/modules/custom-requests";

const statusLabels = { SUBMITTED: "Submitted", CONTACTED: "Contacted", ACCEPTED: "Accepted", REJECTED: "Rejected", COMPLETED: "Completed" } as const;

export default async function CustomRequestsPage() {
  const requests = await getCustomerCustomRequests();
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-outline-variant pb-8"><div><p className="label-caps text-on-surface-variant">Your ideas</p><h1 className="mt-3 headline-lg">Custom requests</h1><p className="mt-4 body-md text-on-surface-variant">Track requests submitted to the Afnan team.</p></div><Link href="/custom-request" className="border border-primary bg-primary px-6 py-3 label-caps text-on-primary">New request</Link></header>
      {requests.length === 0 ? <div className="border border-outline-variant bg-surface px-6 py-16 text-center"><h2 className="headline-md">No custom requests yet</h2><p className="mx-auto mt-4 max-w-lg body-md text-on-surface-variant">Tell us about a handmade piece you would like created.</p><Link href="/custom-request" className="mt-7 inline-flex border border-primary px-6 py-3 label-caps">Start a request</Link></div> : <div className="space-y-6">{requests.map((request) => <article key={request.id} className="border border-outline-variant bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-5 border-b border-outline-variant pb-5"><div><p className="label-caps text-on-surface-variant">{request.requestNumber}</p><h2 className="mt-2 headline-sm">{request.title}</h2><p className="mt-2 body-sm text-on-surface-variant">Submitted {new Intl.DateTimeFormat("en-EG", { dateStyle: "medium" }).format(new Date(request.createdAt))}</p></div><span className="border border-primary px-3 py-1 label-caps">{statusLabels[request.status]}</span></div><p className="mt-5 line-clamp-3 whitespace-pre-line body-md text-on-surface-variant">{request.description}</p><div className="mt-5 flex justify-end"><Link href={`/account/custom-requests/${request.requestNumber}`} className="label-caps underline underline-offset-4">View request</Link></div></article>)}</div>}
    </main>
  );
}
