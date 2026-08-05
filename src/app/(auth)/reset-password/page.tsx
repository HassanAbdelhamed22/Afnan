import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password — Afnan",
  description: "Set a new password for your Afnan account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <header className="mb-8">
          <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-on-surface-variant lg:hidden">Account recovery</p>
          <h1 className="mb-2 font-serif text-[2.25rem] leading-tight tracking-[-0.025em] text-on-background sm:text-[2.5rem]">
            Invalid link
          </h1>
          <p className="max-w-md text-sm leading-6 text-on-surface-variant sm:text-base">
            This password reset link is missing or expired. Please request a new
            one.
          </p>
        </header>
        <Link
          href="/forgot-password"
          className="inline-flex min-h-12 w-full items-center justify-center bg-primary px-6 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-on-primary no-underline transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Request a new link
        </Link>
      </>
    );
  }

  return (
    <>
      <header className="mb-9 sm:mb-10">
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-on-surface-variant lg:hidden">Account recovery</p>
        <h1 className="mb-2 font-serif text-[2.25rem] leading-tight tracking-[-0.025em] text-on-background sm:text-[2.5rem]">
          Reset your password
        </h1>
        <p className="max-w-md text-sm leading-6 text-on-surface-variant sm:text-base">
          Enter and confirm your new password
        </p>
      </header>

      <ResetPasswordForm token={token} />
    </>
  );
}
