import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — Afnan",
  description:
    "Sign in to your Afnan account to browse handmade products and manage orders.",
};

type LoginPageProps = {
  searchParams: Promise<{
    returnTo?: string;
    verified?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { returnTo, verified, error } = await searchParams;

  return (
    <>
      <header className="mb-9 sm:mb-10">
        {/* Mobile-only brand hint (desktop sees the brand panel) */}
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-on-surface-variant lg:hidden">
          Welcome to Afnan
        </p>
        <h1 className="mb-2 font-serif text-[2.25rem] leading-tight tracking-tight text-on-background sm:text-[2.5rem]">Welcome back</h1>
        <p className="text-sm leading-6 text-on-surface-variant sm:text-base">
          Sign in to your account
        </p>
      </header>

      <LoginForm
        returnTo={returnTo}
        verified={verified === "true"}
        verificationError={Boolean(error)}
      />
    </>
  );
}
