"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { registerAction } from "@/modules/auth/actions";
import { registerSchema } from "@/modules/auth/schemas";
import type { ActionResult } from "@/lib/results/action-result";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/ui/checkbox";
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
const countryPrefixClass =
  "flex min-h-12 shrink-0 items-center border border-solid border-outline-variant bg-surface px-3.5 font-sans text-sm font-semibold text-on-background";

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  const [sameAsWhatsApp, setSameAsWhatsApp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    whatsappPhone: "",
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
  } = useFormValidation({
    schema: registerSchema,
    values: {
      ...values,
      sameAsWhatsApp: sameAsWhatsApp ? "true" : "false",
    },
  });

  const updateValue = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    handleChange(field, value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const payload = {
      ...values,
      sameAsWhatsApp: sameAsWhatsApp ? "true" : "false",
    };

    const isValid = validateAll(payload);
    if (!isValid) {
      e.preventDefault();
      toast.show("Please correct the highlighted fields", "error");
    }
  };

  /* Trigger toast alerts on result and redirect to login if successful */
  useEffect(() => {
    if (!state.ok) {
      toast.show(state.error.message || "Registration failed", "error");
      if (state.error.fieldErrors) {
        setServerErrors(state.error.fieldErrors);
      }
    } else if (state.message) {
      toast.show(state.message, "success");
      setTimeout(() => {
        router.push("/login");
      }, 800);
    }
  }, [state, setServerErrors, router]);

  /* Combine: prefer client errors (instant), fall back to server */
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
      {/* ── Full Name ── */}
      <FormField htmlFor="register-name" label="Full name" error={getError("name")}>
        <div className={`${fieldShell} ${getError("name") ? "border-error" : ""}`}>
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
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            required
            aria-invalid={Boolean(getError("name"))}
            aria-describedby={getError("name") ? "register-name-error" : undefined}
            className={inputClass}
            value={values.name}
            onBlur={(e) => handleBlur("name", e.target.value)}
            onChange={(e) => updateValue("name", e.target.value)}
          />
        </div>
      </FormField>

      {/* ── Email ── */}
      <FormField htmlFor="register-email" label="Email" error={getError("email")}>
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
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={Boolean(getError("email"))}
            aria-describedby={getError("email") ? "register-email-error" : undefined}
            className={inputClass}
            value={values.email}
            onBlur={(e) => handleBlur("email", e.target.value)}
            onChange={(e) => updateValue("email", e.target.value)}
          />
        </div>
      </FormField>

      {/* ── Phone Number ── */}
      <FormField htmlFor="register-phone" label="Phone number" error={getError("phone")}>
        <div className="flex items-center gap-2">
          {/* Country code prefix dropdown badge */}
          <div className={countryPrefixClass} aria-label="Egypt country code">
            <span className="mr-2 text-[0.625rem] font-bold tracking-[0.12em] text-on-surface-variant">EG</span>
            <span>+20</span>
          </div>

          {/* Input container */}
          <div className={`${fieldShell} min-w-0 flex-1 ${getError("phone") ? "border-error" : ""}`}>
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
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.47-5.116-3.762-6.586-6.586l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
            <input
              id="register-phone"
              name="phone"
              type="text"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01012345678"
              required
              aria-invalid={Boolean(getError("phone"))}
              aria-describedby={getError("phone") ? "register-phone-error" : undefined}
              className={inputClass}
              value={values.phone}
              onBlur={(e) => handleBlur("phone", e.target.value)}
              onChange={(e) => updateValue("phone", e.target.value)}
            />
          </div>
        </div>
      </FormField>

      {/* ── WhatsApp Toggle ── */}
      <div>
        <input
          type="hidden"
          name="sameAsWhatsApp"
          value={sameAsWhatsApp ? "true" : "false"}
        />

        <Checkbox
          checked={sameAsWhatsApp}
          onChange={(e) => setSameAsWhatsApp(e.target.checked)}
          label="Same number for WhatsApp"
        />

        {/* Conditional WhatsApp field */}
        <div
          className="overflow-hidden transition-all duration-300 ease-expo-out"
          style={{
            maxHeight: sameAsWhatsApp ? 0 : 100,
            opacity: sameAsWhatsApp ? 0 : 1,
            marginTop: sameAsWhatsApp ? 0 : 12,
          }}
        >
          {!sameAsWhatsApp && (
            <FormField
              htmlFor="register-whatsapp"
              label="WhatsApp number"
              error={getError("whatsappPhone")}
            >
              <div className="flex items-center gap-2">
                <div className={countryPrefixClass} aria-label="Egypt country code">
                  <span className="mr-2 text-[0.625rem] font-bold tracking-[0.12em] text-on-surface-variant">EG</span>
                  <span>+20</span>
                </div>
                <div className={`${fieldShell} min-w-0 flex-1 ${getError("whatsappPhone") ? "border-error" : ""}`}>
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
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.47-5.116-3.762-6.586-6.586l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  <input
                    id="register-whatsapp"
                    name="whatsappPhone"
                    type="text"
                    inputMode="tel"
                    placeholder="01012345678"
                    aria-invalid={Boolean(getError("whatsappPhone"))}
                    aria-describedby={getError("whatsappPhone") ? "register-whatsapp-error" : undefined}
                    className={inputClass}
                    value={values.whatsappPhone}
                    onBlur={(e) => handleBlur("whatsappPhone", e.target.value)}
                    onChange={(e) => updateValue("whatsappPhone", e.target.value)}
                  />
                </div>
              </div>
            </FormField>
          )}
        </div>
      </div>

      {/* ── Password ── */}
      <FormField htmlFor="register-password" label="Password" error={getError("password")}>
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
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            aria-invalid={Boolean(getError("password"))}
            aria-describedby={`register-password-requirements${getError("password") ? " register-password-error" : ""}`}
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
        <div id="register-password-requirements" className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[11px] select-none">
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
      <FormField htmlFor="register-confirm-password" label="Confirm password" error={getError("confirmPassword")}>
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
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            aria-invalid={Boolean(getError("confirmPassword"))}
            aria-describedby={getError("confirmPassword") ? "register-confirm-password-error" : undefined}
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

      {/* Errors */}
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

      {/* Submit button */}
      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-3 min-h-12 w-full py-3 font-sans text-xs font-semibold tracking-[0.12em] hover:-translate-y-px"
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>

      {/* Links */}
      <p className="mt-1 text-center font-sans text-xs leading-6 text-on-surface-variant sm:text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-on-background underline decoration-outline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Sign in
        </Link>
      </p>

      {/* Terms & Privacy statement */}
      <p className="mt-1 text-center font-sans text-[0.6875rem] leading-5 text-on-surface-variant/70">
        By creating an account, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-2 hover:text-on-background"
        >
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-on-background"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
