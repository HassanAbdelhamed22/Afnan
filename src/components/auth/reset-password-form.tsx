"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { resetPasswordAction } from "@/modules/auth/actions";
import { resetPasswordSchema } from "@/modules/auth/schemas";
import type { ActionResult } from "@/lib/results/action-result";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

const initialState: ActionResult<Record<string, never>> = {
  ok: true,
  data: {},
};

const fieldShell =
  "flex min-h-12 items-center gap-3 border border-solid border-outline-variant bg-surface px-3.5 transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary";
const inputClass =
  "min-w-0 flex-1 bg-transparent py-3 text-sm text-on-background outline-none placeholder:text-on-surface-variant/45";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
  });

  const hasMinLength = values.password.length >= 8;
  const hasNumber = /[0-9]/.test(values.password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(values.password);

  const {
    errors: clientErrors,
    handleBlur,
    handleChange,
    setServerErrors,
    validateAll,
  } = useFormValidation({ schema: resetPasswordSchema, values });

  const updateValue = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    handleChange(field, value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const isValid = validateAll({ ...values, token });
    if (!isValid) {
      e.preventDefault();
      toast.show("Please correct the highlighted fields", "error");
    }
  };

  useEffect(() => {
    if (!state.ok) {
      toast.show(state.error.message || "Reset failed", "error");
      if (state.error.fieldErrors) {
        setServerErrors(state.error.fieldErrors);
      }
    } else if (state.message) {
      toast.show(state.message, "success");
      router.push("/login");
    }
  }, [state, setServerErrors, router]);

  const serverFieldErrors = !state.ok ? state.error.fieldErrors : undefined;
  const getError = (field: string) =>
    clientErrors[field]?.[0] ?? serverFieldErrors?.[field]?.[0];

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      <input type="hidden" name="token" value={token} />

      {/* ── New Password ── */}
      <FormField htmlFor="reset-password" label="New password" error={getError("password")}>
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
            id="reset-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            aria-invalid={Boolean(getError("password"))}
            aria-describedby={`reset-password-requirements${getError("password") ? " reset-password-error" : ""}`}
            className={`${inputClass} pr-9`}
            value={values.password}
            onBlur={(e) => handleBlur("password", e.target.value)}
            onChange={(e) => updateValue("password", e.target.value)}
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

        {/* Password requirements bullets */}
        <div id="reset-password-requirements" className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[11px] select-none">
          <span className={cn(
            "flex items-center gap-1.5 transition-colors duration-200",
            hasMinLength ? "text-on-background font-semibold" : "text-on-surface-variant/50"
          )}>
            <span className={cn(
              "w-1 h-1 transition-colors duration-200",
              hasMinLength ? "bg-primary" : "bg-on-surface-variant/35"
            )} />
            At least 8 characters
          </span>
          <span className={cn(
            "flex items-center gap-1.5 transition-colors duration-200",
            hasNumber ? "text-on-background font-semibold" : "text-on-surface-variant/50"
          )}>
            <span className={cn(
              "w-1 h-1 transition-colors duration-200",
              hasNumber ? "bg-primary" : "bg-on-surface-variant/35"
            )} />
            One number
          </span>
          <span className={cn(
            "flex items-center gap-1.5 transition-colors duration-200",
            hasSpecialChar ? "text-on-background font-semibold" : "text-on-surface-variant/50"
          )}>
            <span className={cn(
              "w-1 h-1 transition-colors duration-200",
              hasSpecialChar ? "bg-primary" : "bg-on-surface-variant/35"
            )} />
            One special character
          </span>
        </div>
      </FormField>

      {/* ── Confirm Password ── */}
      <FormField htmlFor="reset-confirm-password" label="Confirm password" error={getError("confirmPassword")}>
        <div className={`${fieldShell} relative ${getError("confirmPassword") ? "border-error" : ""}`}>
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
            id="reset-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            aria-invalid={Boolean(getError("confirmPassword"))}
            aria-describedby={getError("confirmPassword") ? "reset-confirm-password-error" : undefined}
            className={`${inputClass} pr-9`}
            value={values.confirmPassword}
            onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
            onChange={(e) => updateValue("confirmPassword", e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
            aria-pressed={showConfirmPassword}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center text-on-surface-variant/65 outline-none transition-colors hover:text-on-background focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showConfirmPassword ? (
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

      {!state.ok && (
        <p role="alert" className="mt-1 border-l-2 border-error bg-error-container/35 px-3 py-2.5 font-sans text-sm text-error">
          {state.error.message}
        </p>
      )}

      {state.ok && state.message && (
        <p role="status" className="mt-1 border-l-2 border-primary bg-surface-container-low px-3 py-2.5 font-sans text-sm text-on-background">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-3 min-h-12 w-full py-3 font-sans text-xs font-semibold tracking-[0.12em] hover:-translate-y-px"
      >
        {pending ? "Resetting password…" : "Reset password"}
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
