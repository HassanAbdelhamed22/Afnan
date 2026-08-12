"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/auth/auth-client";
import { toast } from "@/components/ui/toast";
import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/modules/wishlist/actions";

interface WishlistContextValue {
  itemCount: number;
  isSaved: (productId: string) => boolean;
  toggle: (productId: string, returnTo: string, desiredSaved?: boolean) => Promise<void>;
  pendingProductId: string | null;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void fetch("/api/wishlist", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as {
          success: boolean;
          data?: { productIds?: string[] };
        };
        if (active && payload.success) setSavedIds(payload.data?.productIds ?? []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  const visibleSavedIds = useMemo(() => (userId ? savedIds : []), [savedIds, userId]);
  const isSaved = useCallback(
    (productId: string) => visibleSavedIds.includes(productId),
    [visibleSavedIds],
  );
  const toggle = useCallback(
    async (productId: string, returnTo: string, desiredSaved?: boolean) => {
      if (!userId) {
        router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      const currentlySaved = savedIds.includes(productId);
      const shouldSave = desiredSaved ?? !currentlySaved;
      setPendingProductId(productId);
      try {
        const result = shouldSave
          ? await addToWishlistAction({ productId })
          : await removeFromWishlistAction({ productId });
        if (!result.ok) {
          toast.show(result.error.message, "error");
          return;
        }
        setSavedIds((current) =>
          result.data.isSaved
            ? Array.from(new Set([...current, productId]))
            : current.filter((id) => id !== productId),
        );
        toast.show(result.message ?? "Wishlist updated", "success");
        router.refresh();
      } catch {
        toast.show("Your session expired. Please sign in again.", "error");
        router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      } finally {
        setPendingProductId(null);
      }
    },
    [router, savedIds, userId],
  );

  const value = useMemo(
    () => ({ itemCount: visibleSavedIds.length, isSaved, toggle, pendingProductId }),
    [isSaved, pendingProductId, toggle, visibleSavedIds.length],
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
