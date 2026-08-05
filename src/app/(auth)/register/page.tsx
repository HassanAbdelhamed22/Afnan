import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account — Afnan",
  description: "Register for an Afnan account to shop Egyptian handmade products.",
};

export default function RegisterPage() {
  return (
    <>
      <header className="mb-8 sm:mb-9">
        <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-on-surface-variant lg:hidden">
          Welcome to Afnan
        </p>
        <h1 className="mb-2 font-serif text-[2.25rem] leading-tight tracking-tight text-on-background sm:text-[2.5rem]">Create your account</h1>
        <p className="text-sm leading-6 text-on-surface-variant sm:text-base">
          Join Afnan to discover handmade treasures
        </p>
      </header>

      <RegisterForm />
    </>
  );
}
