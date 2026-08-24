"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteCategoryAction } from "@/modules/categories/admin-actions";
import { deleteProductAction } from "@/modules/products/admin-actions";

type Props = {
  entity: "product" | "category";
  entityId: string;
  entityName: string;
  redirectTo?: string;
};

export function CatalogDeleteButton({ entity, entityId, entityName, redirectTo }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const entityLabel = entity === "product" ? "product" : "category";

  function remove() {
    startTransition(async () => {
      const data = new FormData();
      data.set(entity === "product" ? "productId" : "categoryId", entityId);
      const result = entity === "product" ? await deleteProductAction(data) : await deleteCategoryAction(data);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setError("");
      setOpen(false);
      if (redirectTo) router.replace(redirectTo);
      else router.refresh();
    });
  }

  return (
    <div>
      <Button type="button" variant="text" disabled={pending} className="text-error" onClick={() => { setError(""); setOpen(true); }}>
        Delete {entityLabel}
      </Button>
      <Dialog isOpen={open} onClose={() => { if (!pending) setOpen(false); }} title={`Delete ${entityLabel}?`} className="max-w-md">
        <p className="body-md text-on-surface-variant">
          <strong className="text-on-background">{entityName}</strong> will be permanently deleted. This cannot be undone.
        </p>
        <div className="mt-5 border-l-2 border-error bg-error-container/20 px-4 py-3 body-sm text-error">
          {entity === "product"
            ? "Only archived or draft products that are not included in an order can be deleted. Otherwise, keep the product archived."
            : "Only archived categories with no products can be deleted. Otherwise, keep the category archived."}
        </div>
        {error ? <p role="alert" className="mt-4 body-sm text-error">{error}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-outline-variant pt-5">
          <Button type="button" variant="secondary" disabled={pending} onClick={() => setOpen(false)}>Keep {entityLabel}</Button>
          <Button type="button" disabled={pending} aria-busy={pending} className="bg-error text-on-error hover:opacity-85" onClick={remove}>
            {pending ? "Deleting…" : `Delete ${entityLabel} permanently`}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
