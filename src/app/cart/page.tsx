import Link from "next/link";

import { CartView } from "@/components/cart/cart-view";
import { getCurrentSession } from "@/modules/auth/dal";
import { getCustomerCart } from "@/modules/cart";

export default async function CartPage() {
  const session = await getCurrentSession();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10 border-b border-outline-variant pb-8">
        <p className="label-caps text-on-surface-variant">Your selection</p>
        <h1 className="mt-3 headline-lg text-on-background">Shopping cart</h1>
        <p className="mt-4 max-w-2xl body-md text-on-surface-variant">
          Product prices, stock, and preparation times are checked from the current catalog.
        </p>
      </header>

      {session ? (
        <CartView cart={await getCustomerCart()} />
      ) : (
        <div className="border border-outline-variant bg-surface px-6 py-16 text-center">
          <h2 className="headline-md text-on-background">Sign in to use your cart</h2>
          <p className="mx-auto mt-4 max-w-lg body-md text-on-surface-variant">
            Your authenticated cart is saved securely and revalidated before checkout.
          </p>
          <Link
            href="/login?returnTo=/cart"
            className="mt-8 inline-flex border border-primary bg-primary px-6 py-3 label-caps text-on-primary"
          >
            Sign in
          </Link>
        </div>
      )}
    </main>
  );
}
