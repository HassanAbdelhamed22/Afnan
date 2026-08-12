"use client";

import { cn } from "@/lib/utils";
import { useWishlist } from "./wishlist-provider";

export function WishlistButton({
  productId,
  productName,
  returnTo,
  variant = "icon",
  isSavedInitially,
}: {
  productId: string;
  productName: string;
  returnTo: string;
  variant?: "icon" | "full";
  isSavedInitially?: boolean;
}) {
  const { isSaved, toggle, pendingProductId } = useWishlist();
  const saved = isSavedInitially ?? isSaved(productId);
  const pending = pendingProductId === productId;
  const label = saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={saved}
      disabled={pending}
      onClick={() => void toggle(productId, returnTo, !saved)}
      className={cn(
        "inline-flex items-center justify-center border border-outline-variant bg-background text-on-background transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50",
        variant === "icon" ? "size-10" : "w-full gap-2 px-6 py-3 label-caps",
      )}
    >
      <svg className="size-5" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {variant === "full" && (pending ? "Updating…" : saved ? "Saved to Wishlist" : "Add to Wishlist")}
    </button>
  );
}
