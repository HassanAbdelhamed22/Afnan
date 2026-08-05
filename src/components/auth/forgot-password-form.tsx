"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";

import { forgotPasswordAction } from "@/modules/auth/actions";
import { forgotPasswordSchema } from "@/modules/auth/schemas";
import type { ActionResult } from "@/lib/results/action-result";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const initialState: ActionResult<Record<string, never>> = {
  ok: true,
  data: {},
};

const fieldShell =
  "flex min-h-12 items-center gap-3 border border-solid border-outline-variant bg-surface px-3.5 transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  const {
    errors: clientErrors,
    handleBlur,
    handleChange,
    setServerErrors,
  } = useFormValidation({ schema: forgotPasswordSchema });

  useEffect(() => {
    if (!state.ok && state.error.fieldErrors) {
      setServerErrors(state.error.fieldErrors);
    }
  }, [state, setServerErrors]);

  const serverFieldErrors = !state.ok ? state.error.fieldErrors : undefined;
  const getError = (field: string) =>
    clientErrors[field]?.[0] ?? serverFieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormField htmlFor="forgot-email" label="Email" error={getError("email")}>
        <div className={`${fieldShell} ${getError("email") ? "border-error" : ""}`}>
          <svg
            className="w-4 h-4 text-on-surface-variant/60 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={Boolean(getError("email"))}
            aria-describedby={getError("email") ? "forgot-email-error" : undefined}
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-on-background outline-none placeholder:text-on-surface-variant/45"
            onBlur={(e) => handleBlur("email", e.target.value)}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </FormField>

      {!state.ok && (
        <p role="alert" className="border-l-2 border-error bg-error-container/35 px-3 py-2.5 font-sans text-sm text-error">
          {state.error.message}
        </p>
      )}

      {state.ok && state.message && (
        <p role="status" className="border-l-2 border-primary bg-surface-container-low px-3 py-2.5 font-sans text-sm text-on-background">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-2 min-h-12 w-full py-3 font-sans text-xs font-semibold tracking-[0.12em] shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-px"
      >
        {pending ? "Sending reset link…" : "Send reset link"}
      </Button>

      <p className="mt-1 text-center font-sans text-xs leading-6 text-on-surface-variant sm:text-sm">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-on-background underline decoration-outline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
