import * as React from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("inline-flex items-center gap-3 cursor-pointer select-none", className)}>
        <div className="relative">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div className="h-5 w-5 border border-solid border-outline-variant bg-transparent transition-colors duration-200 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center peer-checked:[&_svg]:scale-100">
            <svg
              className="h-3.5 w-3.5 text-on-primary scale-0 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        {label && <span className="font-sans text-sm text-on-background">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
