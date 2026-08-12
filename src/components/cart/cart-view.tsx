"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { formatEGP } from "@/lib/money";
import {
  clearCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/modules/cart/actions";
import type { CartDTO, CartItemDTO } from "@/modules/cart/dto";

const issueMessages: Record<NonNullable<CartItemDTO["issue"]>, string> = {
  PRODUCT_UNAVAILABLE: "This product is no longer available.",
  VARIANT_UNAVAILABLE: "This product option is no longer available.",
  OUT_OF_STOCK: "This product option is currently out of stock.",
  INVALID_PREPARATION_TIME: "This made-to-order option is temporarily unavailable.",
  QUANTITY_EXCEEDS_STOCK: "The selected quantity exceeds current stock.",
};

function announceCartChange(itemCount: number) {
  window.dispatchEvent(new CustomEvent("cart-updated", { detail: { itemCount } }));
}

export function CartView({ cart }: { cart: CartDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const runMutation = (
    operation: () => ReturnType<typeof clearCartAction>,
    onSuccess?: () => void,
  ) => {
    startTransition(async () => {
      const result = await operation();
      if (!result.ok) {
        toast.show(result.error.message, "error");
        return;
      }
      toast.show(result.message ?? "Cart updated", "success");
      announceCartChange(result.data.itemCount);
      onSuccess?.();
      router.refresh();
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="border border-outline-variant bg-surface px-6 py-16 text-center">
        <p className="label-caps text-on-surface-variant">Your selection</p>
        <h2 className="mt-3 headline-md text-on-background">Your cart is empty</h2>
        <p className="mx-auto mt-4 max-w-xl body-md text-on-surface-variant">
          Explore the collection and choose a handmade piece to begin your order.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex border border-primary bg-primary px-6 py-3 label-caps text-on-primary transition-colors hover:bg-primary-hover"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section aria-labelledby="cart-items-heading">
        <div className="mb-5 flex items-center justify-between border-b border-outline-variant pb-5">
          <h2 id="cart-items-heading" className="headline-sm text-on-background">
            Selected pieces
          </h2>
          <Button
            type="button"
            variant="text"
            disabled={pending}
            onClick={() => setClearDialogOpen(true)}
          >
            Clear cart
          </Button>
        </div>

        <div className="divide-y divide-outline-variant border-y border-outline-variant">
          {cart.items.map((item) => (
            <article key={item.id} className="grid gap-5 py-6 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <Link
                href={item.productSlug ? `/product/${item.productSlug}` : "/shop"}
                className="relative aspect-4/5 overflow-hidden border border-outline-variant bg-[#F7F7F5]"
              >
                {item.image ? (
                  <Image src={item.image.url} alt={item.productName} fill className="object-contain p-2" />
                ) : (
                  <span className="flex h-full items-center justify-center px-3 text-center body-sm text-on-surface-variant">
                    No image
                  </span>
                )}
              </Link>

              <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={item.productSlug ? `/product/${item.productSlug}` : "/shop"}
                      className="headline-sm text-on-background hover:underline hover:underline-offset-4"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 label-caps text-on-surface-variant">{item.variantLabel}</p>
                  </div>
                  <p className="body-md font-semibold text-on-background">
                    {item.available ? formatEGP(item.lineTotalAmount) : "Unavailable"}
                  </p>
                </div>

                {item.personalization && (
                  <p className="mt-4 border-l border-outline-variant pl-3 body-sm text-on-surface-variant">
                    Personalization: {item.personalization}
                  </p>
                )}

                {item.fulfillmentType === "MADE_TO_ORDER" && item.preparationDaysMin && (
                  <p className="mt-3 body-sm text-on-surface-variant">
                    Preparation: {item.preparationDaysMin}–{item.preparationDaysMax} days
                  </p>
                )}

                {item.issue && (
                  <p role="alert" className="mt-4 border-l-2 border-error bg-error-container/25 px-3 py-2 body-sm text-error">
                    {issueMessages[item.issue]}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-end justify-between gap-5 pt-5">
                  <div>
                    <label htmlFor={`quantity-${item.id}`} className="label-caps text-on-surface-variant">
                      Quantity
                    </label>
                    <div className="mt-2 flex h-10 items-center border border-outline-variant">
                      <button
                        type="button"
                        disabled={pending || item.quantity <= 1}
                        onClick={() =>
                          runMutation(() =>
                            updateCartItemAction({ itemId: item.id, quantity: item.quantity - 1 }),
                          )
                        }
                        className="size-10 border-0 border-r border-outline-variant bg-transparent text-on-background disabled:opacity-35"
                        aria-label={`Decrease ${item.productName} quantity`}
                      >
                        −
                      </button>
                      <span id={`quantity-${item.id}`} className="min-w-10 text-center body-sm text-on-background">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={
                          pending ||
                          !item.available ||
                          (item.fulfillmentType === "READY_MADE" &&
                            item.quantity >= (item.stockQuantity ?? 0))
                        }
                        onClick={() =>
                          runMutation(() =>
                            updateCartItemAction({ itemId: item.id, quantity: item.quantity + 1 }),
                          )
                        }
                        className="size-10 border-0 border-l border-outline-variant bg-transparent text-on-background disabled:opacity-35"
                        aria-label={`Increase ${item.productName} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="body-sm text-on-surface-variant">
                      {formatEGP(item.unitPriceAmount)} each
                    </p>
                    <Button
                      type="button"
                      variant="text"
                      disabled={pending}
                      className="mt-2 text-error"
                      onClick={() =>
                        runMutation(() => removeCartItemAction({ itemId: item.id }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="border border-outline-variant bg-surface p-6 lg:sticky lg:top-28">
        <p className="label-caps text-on-surface-variant">Order summary</p>
        <div className="mt-5 flex items-center justify-between border-b border-outline-variant pb-5 body-md">
          <span>Subtotal</span>
          <strong>{formatEGP(cart.subtotalAmount)}</strong>
        </div>
        <p className="mt-5 body-sm text-on-surface-variant">
          Egyptian governorate shipping is calculated at checkout. Payment is cash on delivery.
        </p>
        {cart.canCheckout ? (
          <Link
            href="/checkout"
            className="mt-7 flex w-full items-center justify-center border border-primary bg-primary px-6 py-3 label-caps text-on-primary transition-colors hover:bg-primary-hover"
          >
            Continue to checkout
          </Link>
        ) : (
          <div className="mt-7 border border-outline-variant bg-surface-container-low px-4 py-3 body-sm text-on-surface-variant">
            Resolve unavailable items before checkout.
          </div>
        )}
      </aside>

      <Dialog
        isOpen={clearDialogOpen}
        onClose={() => {
          if (!pending) setClearDialogOpen(false);
        }}
        title="Clear your cart?"
        className="max-w-md"
      >
        <p className="body-md text-on-surface-variant">
          This will remove every selected piece from your cart. This action cannot be undone.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-outline-variant pt-5">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setClearDialogOpen(false)}
          >
            Keep items
          </Button>
          <Button
            type="button"
            disabled={pending}
            aria-busy={pending}
            className="bg-error text-on-error hover:opacity-85"
            onClick={() =>
              runMutation(() => clearCartAction(), () => setClearDialogOpen(false))
            }
          >
            {pending ? "Clearing…" : "Clear cart"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
