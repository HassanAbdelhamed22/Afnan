"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";

import { loginAction } from "@/modules/auth/actions";
import { loginSchema } from "@/modules/auth/schemas";
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
const inputClass =
  "min-w-0 flex-1 bg-transparent py-3 text-sm text-on-background outline-none placeholder:text-on-surface-variant/45";

type LoginFormProps = {
  returnTo?: string;
};

export function LoginForm({ returnTo = "/" }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);

  const {
    errors: clientErrors,
    handleBlur,
    handleChange,
    setServerErrors,
  } = useFormValidation({ schema: loginSchema });

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
      <input type="hidden" name="returnTo" value={returnTo} />

      {/* ── Email ── */}
      <FormField htmlFor="login-email" label="Email" error={getError("email")}>
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
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={Boolean(getError("email"))}
            aria-describedby={getError("email") ? "login-email-error" : undefined}
            className={inputClass}
            onBlur={(e) => handleBlur("email", e.target.value)}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </FormField>

      {/* ── Password ── */}
      <FormField htmlFor="login-password" label="Password" error={getError("password")}>
        <div className={`${fieldShell} relative ${getError("password") ? "border-error" : ""}`}>
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
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            aria-invalid={Boolean(getError("password"))}
            aria-describedby={getError("password") ? "login-password-error" : undefined}
            className={`${inputClass} pr-9`}
            onBlur={(e) => handleBlur("password", e.target.value)}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center text-on-surface-variant/65 outline-none transition-colors hover:text-on-background focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showPassword ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12c1.274 4.057 5.065 7 9.964 7 4.899 0 8.69-2.943 9.964-7-1.274-4.057-5.065-7-9.964-7-4.899 0-8.69 2.943-9.964 7z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </FormField>

      <div className="-mt-1 flex items-center justify-end">
        <Link
          href="/forgot-password"
          className="font-sans text-xs font-medium text-on-surface-variant underline decoration-outline underline-offset-4 transition-colors duration-300 hover:text-on-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Forgot password?
        </Link>
      </div>

      {!state.ok && (
        <p role="alert" className="border-l-2 border-error bg-error-container/35 px-3 py-2.5 font-sans text-sm text-error">
          {state.error.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-2 min-h-12 w-full py-3 font-sans text-xs font-semibold tracking-[0.12em] shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-px"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center font-sans text-xs leading-6 text-on-surface-variant sm:text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-on-background underline decoration-outline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
