import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatEGP } from "@/lib/money";
import { NotFoundError, UnauthenticatedError } from "@/lib/errors/app-error";
import { getCustomerOrder } from "@/modules/orders";

interface OrderSuccessPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;
  let order;
  try { order = await getCustomerOrder(orderNumber); }
  catch (error) {
    if (error instanceof UnauthenticatedError) redirect(`/login?returnTo=${encodeURIComponent(`/order-success/${orderNumber}`)}`);
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 lg:py-20">
      <header className="border border-primary bg-surface-container-low px-6 py-10 text-center"><p className="label-caps text-primary">Order received</p><h1 className="mt-3 headline-lg">Thank you for your order</h1><p className="mt-4 body-md text-on-surface-variant">Your order number is <strong className="text-on-background">{order.orderNumber}</strong>. We will contact you via WhatsApp for confirmation.</p></header>
      <section className="mt-8 border border-outline-variant bg-surface p-6"><div className="flex flex-wrap justify-between gap-4 border-b border-outline-variant pb-5"><div><p className="label-caps text-on-surface-variant">Status</p><p className="mt-2 body-md font-semibold">{order.status.replaceAll("_", " ")}</p></div><div className="text-right"><p className="label-caps text-on-surface-variant">Total</p><p className="mt-2 body-md font-semibold">{formatEGP(order.totalAmount)}</p></div></div><div className="mt-5 space-y-3">{order.items.map((item) => <div key={`${item.sku}-${item.personalization ?? ""}`} className="flex justify-between gap-5 body-sm"><span>{item.productName} · {item.variantLabel} × {item.quantity}</span><strong>{formatEGP(item.lineTotalAmount)}</strong></div>)}</div><dl className="mt-5 space-y-2 border-t border-outline-variant pt-5 body-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatEGP(order.subtotalAmount)}</dd></div><div className="flex justify-between"><dt>Shipping to {order.governorateName}</dt><dd>{formatEGP(order.shippingFeeAmount)}</dd></div></dl></section>
      <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/account/orders" className="border border-primary px-6 py-3 label-caps">View all orders</Link><Link href="/shop" className="border border-primary bg-primary px-6 py-3 label-caps text-on-primary">Continue shopping</Link></div>
    </main>
  );
}
