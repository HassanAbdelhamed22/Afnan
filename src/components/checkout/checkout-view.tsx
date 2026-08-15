"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatEGP } from "@/lib/money";
import { placeOrderAction } from "@/modules/checkout/actions";
import type { CheckoutDTO } from "@/modules/checkout/dto";

export function CheckoutView({ checkout }: { checkout: CheckoutDTO }) {
  const router = useRouter();
  const defaultAddress = checkout.addresses.find((address) => address.isDefault && address.shippingRate) ?? checkout.addresses.find((address) => address.shippingRate);
  const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [customerNote, setCustomerNote] = useState("");
  const selectedAddress = useMemo(() => checkout.addresses.find((address) => address.id === addressId), [addressId, checkout.addresses]);
  const shippingFee = selectedAddress?.shippingRate?.feeAmount ?? 0;
  const total = checkout.cart.subtotalAmount + shippingFee;

  const placeOrder = () => {
    startTransition(async () => {
      try {
        const result = await placeOrderAction({ addressId, checkoutToken: checkout.checkoutToken, paymentMethod: "CASH_ON_DELIVERY", customerNote: customerNote || undefined });
        if (!result.ok) {
          toast.show(result.error.message, "error");
          return;
        }
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: { itemCount: 0 } }));
        router.push(`/order-success/${encodeURIComponent(result.data.orderNumber)}`);
      } catch {
        toast.show("Your session expired. Please sign in again.", "error");
        router.push("/login?returnTo=/checkout");
      }
    });
  };

  if (!checkout.cart.items.length) {
    return <div className="border border-outline-variant bg-surface px-6 py-16 text-center"><h2 className="headline-md">Your cart is empty</h2><Link href="/shop" className="mt-7 inline-flex border border-primary bg-primary px-6 py-3 label-caps text-on-primary">Browse the shop</Link></div>;
  }
  if (!checkout.cart.canCheckout) {
    return <div className="border border-error bg-error-container/20 px-6 py-10"><h2 className="headline-sm text-error">Your cart needs attention</h2><p className="mt-3 body-md text-on-surface-variant">Resolve unavailable items before placing your order.</p><Link href="/cart" className="mt-6 inline-flex underline underline-offset-4">Return to cart</Link></div>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <section>
        <h2 className="headline-sm">Delivery address</h2>
        {checkout.addresses.length === 0 ? (
          <div className="mt-5 border border-outline-variant bg-surface p-6"><p className="body-md text-on-surface-variant">Add a complete Egyptian delivery address before checkout.</p><Link href="/account/addresses" className="mt-5 inline-flex border border-primary px-5 py-3 label-caps">Add an address</Link></div>
        ) : (
          <div className="mt-5 grid gap-4">
            {checkout.addresses.map((address) => (
              <label key={address.id} className={`block border p-5 ${addressId === address.id ? "border-primary bg-surface-container-low" : "border-outline-variant bg-surface"} ${!address.shippingRate ? "opacity-60" : "cursor-pointer"}`}>
                <div className="flex items-start gap-4">
                  <input type="radio" name="address" value={address.id} checked={addressId === address.id} disabled={!address.shippingRate} onChange={() => setAddressId(address.id)} className="mt-1 size-4 accent-primary" />
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong>{address.label}</strong>{address.isDefault && <span className="label-caps text-primary">Default</span>}</div><p className="mt-2 body-sm text-on-surface-variant">{address.recipientName} · {address.phoneE164}</p><p className="body-sm text-on-surface-variant">{address.street}, Building {address.building}, Floor {address.floor}, Apartment {address.apartment}, {address.city}</p>{address.shippingRate ? <p className="mt-3 body-sm">{formatEGP(address.shippingRate.feeAmount)} · {address.shippingRate.minDeliveryDays}–{address.shippingRate.maxDeliveryDays} delivery days</p> : <p className="mt-3 body-sm text-error">Delivery is currently unavailable for this governorate.</p>}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="mt-10 border-t border-outline-variant pt-7"><h2 className="headline-sm">Payment</h2><div className="mt-5 border border-primary bg-surface-container-low p-5"><strong>Cash on delivery</strong><p className="mt-2 body-sm text-on-surface-variant">We will contact you through WhatsApp to confirm the order before processing.</p></div></div>
        <label className="mt-8 block"><span className="label-caps">Order note (optional)</span><textarea value={customerNote} maxLength={500} onChange={(event) => setCustomerNote(event.target.value)} rows={3} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary" placeholder="Delivery or personalization details for this order" /></label>
      </section>

      <aside className="border border-outline-variant bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="headline-sm">Order summary</h2>
        <div className="mt-5 divide-y divide-outline-variant border-y border-outline-variant">
          {checkout.cart.items.map((item) => <div key={item.id} className="flex gap-4 py-4">{item.image && <div className="relative h-20 w-16 shrink-0 bg-[#F7F7F5]"><Image src={item.image.url} alt="" fill className="object-contain p-1" /></div>}<div className="min-w-0 flex-1"><p className="body-sm font-semibold">{item.productName}</p><p className="body-sm text-on-surface-variant">{item.variantLabel} × {item.quantity}</p></div><span className="body-sm font-semibold">{formatEGP(item.lineTotalAmount)}</span></div>)}
        </div>
        <dl className="mt-5 space-y-3 body-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatEGP(checkout.cart.subtotalAmount)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{selectedAddress?.shippingRate ? formatEGP(shippingFee) : "Select address"}</dd></div><div className="flex justify-between border-t border-outline-variant pt-4 body-md font-semibold"><dt>Total</dt><dd>{formatEGP(total)}</dd></div></dl>
        <Button type="button" className="mt-7 w-full" disabled={pending || !selectedAddress?.shippingRate} aria-busy={pending} onClick={placeOrder}>{pending ? "Placing order…" : "Place cash-on-delivery order"}</Button>
        <p className="mt-4 text-center body-sm text-on-surface-variant">Please do not refresh while the order is being placed.</p>
      </aside>
    </div>
  );
}
