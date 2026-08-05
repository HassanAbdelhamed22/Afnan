import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({
  className,
  label,
  htmlFor,
  error,
  children,
  ...props
}: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="font-sans text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.12em] text-on-background/65"
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <span id={errorId} role="alert" className="mt-1 font-sans text-xs text-error">
          {error}
        </span>
      )}
    </div>
  );
}
