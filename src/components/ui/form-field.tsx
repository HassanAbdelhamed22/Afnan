import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ className, label, error, children, ...props }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
      {label && <span className="font-sans label-caps text-xs text-on-background/60">{label}</span>}
      {children}
      {error && <span className="font-sans text-xs text-red-600 mt-1">{error}</span>}
    </div>
  );
}
