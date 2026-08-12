import Link from "next/link";

import { ProductCard } from "@/components/shared/product-card";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { getCustomerWishlist } from "@/modules/wishlist";

export default async function WishlistPage() {
  const wishlist = await getCustomerWishlist();
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <header className="mb-10 border-b border-outline-variant pb-8">
        <p className="label-caps text-on-surface-variant">Saved for later</p>
        <h1 className="mt-3 headline-lg text-on-background">My wishlist</h1>
        <p className="mt-4 max-w-2xl body-md text-on-surface-variant">
          Keep handmade pieces here while you decide. Availability and prices always reflect the current catalog.
        </p>
      </header>

      {wishlist.items.length === 0 ? (
        <div className="border border-outline-variant bg-surface px-6 py-16 text-center">
          <h2 className="headline-md text-on-background">Your wishlist is empty</h2>
          <p className="mx-auto mt-4 max-w-lg body-md text-on-surface-variant">
            Save pieces from the shop so you can return to them later.
          </p>
          <Link href="/shop" className="mt-8 inline-flex border border-primary bg-primary px-6 py-3 label-caps text-on-primary">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.items.map((item) =>
            item.product ? (
              <ProductCard key={item.productId} product={item.product} wishlistSaved />
            ) : (
              <article key={item.productId} className="flex min-h-64 flex-col justify-between border border-outline-variant bg-surface p-5">
                <div>
                  <p className="label-caps text-error">Unavailable</p>
                  <h2 className="mt-3 headline-sm text-on-background">Product no longer available</h2>
                  <p className="mt-3 body-sm text-on-surface-variant">You can safely remove this saved item.</p>
                </div>
                <WishlistButton productId={item.productId} productName="unavailable product" returnTo="/account/wishlist" variant="full" isSavedInitially />
              </article>
            ),
          )}
        </div>
      )}
    </main>
  );
}
