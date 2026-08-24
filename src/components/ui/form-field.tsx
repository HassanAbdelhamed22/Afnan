"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ className, label, htmlFor, hint, error, children, ...props }: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = React.useId();
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)} {...props}>
      {label ? (
        <div className="flex items-center gap-2">
          <label htmlFor={htmlFor} className={cn("font-sans text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.12em]", error ? "text-error" : "text-on-background/65")}>{label}</label>
          {hint ? (
            <span className="group relative inline-flex">
              <button
                type="button"
                aria-label={`Help for ${label}`}
                aria-describedby={hintId}
                aria-expanded={helpOpen}
                onFocus={() => setHelpOpen(true)}
                onBlur={() => setHelpOpen(false)}
                onClick={() => setHelpOpen(true)}
                onKeyDown={(event) => { if (event.key === "Escape") setHelpOpen(false); }}
                className="inline-flex size-11 items-center justify-center border border-outline text-sm font-bold leading-none text-on-surface-variant outline-none transition-colors hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:size-7"
              >?</button>
              <span id={hintId} role="tooltip" className={cn("pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-64 border border-outline-variant bg-on-background px-3 py-2 font-sans text-xs font-normal normal-case leading-5 tracking-normal text-background shadow-lg transition-opacity sm:left-1/2 sm:-translate-x-1/2", helpOpen ? "visible opacity-100" : "invisible opacity-0 group-hover:visible group-hover:opacity-100")}>{hint}</span>
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
      {error ? <span id={errorId} role="alert" className="mt-1 font-sans text-xs text-error">{error}</span> : null}
    </div>
  );
}
