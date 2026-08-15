"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { changeCategoryStatusAction } from "@/modules/categories/admin-actions";
import { changeProductStatusAction } from "@/modules/products/admin-actions";

export function ProductStatusButton({ productId, status, label }: { productId: string; status: "DRAFT" | "ACTIVE" | "ARCHIVED"; label: string }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [error, setError] = useState("");
  return <div><button type="button" disabled={pending} className="label-caps underline underline-offset-4 hover:opacity-60 disabled:opacity-40" onClick={() => startTransition(async () => {
    const data = new FormData(); data.set("productId", productId); data.set("status", status); const result = await changeProductStatusAction(data);
    if (!result.ok) setError(result.error.message); else { setError(""); router.refresh(); }
  })}>{pending ? "Working…" : label}</button>{error ? <p role="alert" className="mt-1 max-w-48 body-sm text-error">{error}</p> : null}</div>;
}

export function CategoryStatusButton({ categoryId, isActive, label }: { categoryId: string; isActive: boolean; label: string }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [error, setError] = useState("");
  return <div><button type="button" disabled={pending} className="label-caps underline underline-offset-4 hover:opacity-60 disabled:opacity-40" onClick={() => startTransition(async () => {
    const data = new FormData(); data.set("categoryId", categoryId); data.set("isActive", String(isActive)); const result = await changeCategoryStatusAction(data);
    if (!result.ok) setError(result.error.message); else { setError(""); router.refresh(); }
  })}>{pending ? "Working…" : label}</button>{error ? <p role="alert" className="mt-1 max-w-48 body-sm text-error">{error}</p> : null}</div>;
}
