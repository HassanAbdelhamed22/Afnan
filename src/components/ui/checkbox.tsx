import * as React from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("group inline-flex min-h-8 cursor-pointer select-none items-center gap-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60", className)}>
        <div className="relative">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div className="flex h-5 w-5 items-center justify-center border border-solid border-outline bg-surface transition-[background-color,border-color,box-shadow] duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-[0_0_0_2px_var(--surface),0_0_0_3px_var(--primary)] peer-checked:[&_svg]:scale-100">
            <svg
              className="h-3.5 w-3.5 text-on-primary scale-0 transition-transform duration-200"
              aria-hidden="true"
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
        {label && <span className="font-sans text-xs text-on-background transition-colors group-has-[:checked]:font-semibold group-has-[:checked]:text-primary sm:text-sm">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
