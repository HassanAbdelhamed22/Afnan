"use client";

import Link from "next/link";
import { useEffect } from "react";

import { toast } from "@/components/ui/toast";

export function CheckoutVerificationRequired() {
  useEffect(() => {
    toast.show("Verify your email before checkout.", "error");
  }, []);

  return (
    <div className="border border-outline-variant bg-surface px-6 py-14 text-center">
      <p className="label-caps text-error">Checkout unavailable</p>
      <h2 className="mt-3 headline-md text-on-background">Email verification required</h2>
      <p className="mx-auto mt-4 max-w-xl body-md text-on-surface-variant">
        Verify the email address connected to your account before placing an order.
      </p>
      <Link
        href="/cart"
        className="mt-7 inline-flex border border-primary px-6 py-3 label-caps text-primary"
      >
        Return to cart
      </Link>
    </div>
  );
}
