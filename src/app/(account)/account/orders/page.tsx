import Link from "next/link";
import { formatEGP } from "@/lib/money";
import { getCustomerOrders } from "@/modules/orders";

export default async function OrdersPage() {
  const orders = await getCustomerOrders();
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10 border-b border-outline-variant pb-8"><p className="label-caps text-on-surface-variant">Your purchases</p><h1 className="mt-3 headline-lg">Order history</h1></header>
      {orders.length === 0 ? <div className="border border-outline-variant bg-surface px-6 py-16 text-center"><h2 className="headline-md">No orders yet</h2><Link href="/shop" className="mt-7 inline-flex border border-primary bg-primary px-6 py-3 label-caps text-on-primary">Browse the shop</Link></div> : <div className="space-y-5">{orders.map((order) => <article key={order.id} className="border border-outline-variant bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-5 border-b border-outline-variant pb-5"><div><p className="label-caps text-on-surface-variant">{order.orderNumber}</p><h2 className="mt-2 headline-sm">{order.items.length} {order.items.length === 1 ? "item" : "items"}</h2><p className="mt-2 body-sm text-on-surface-variant">{new Intl.DateTimeFormat("en-EG", { dateStyle: "medium" }).format(new Date(order.createdAt))}</p></div><div className="text-right"><span className="border border-primary px-3 py-1 label-caps">{order.status.replaceAll("_", " ")}</span><p className="mt-3 body-md font-semibold">{formatEGP(order.totalAmount)}</p></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="body-sm text-on-surface-variant">Delivery to {order.governorateName} · Cash on delivery</p><Link href={`/order-success/${order.orderNumber}`} className="label-caps underline underline-offset-4">View order</Link></div></article>)}</div>}
    </main>
  );
}
