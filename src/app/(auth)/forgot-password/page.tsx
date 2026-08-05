import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — Afnan",
  description: "Request a password reset link for your Afnan account.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <header className="mb-9 sm:mb-10">
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-on-surface-variant lg:hidden">
          Account recovery
        </p>
        <h1 className="mb-2 font-serif text-[2.25rem] leading-tight tracking-tight text-on-background sm:text-[2.5rem]">
          Forgot your password?
        </h1>
        <p className="max-w-md text-sm leading-6 text-on-surface-variant sm:text-base">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </header>

      <ForgotPasswordForm />
    </>
  );
}
